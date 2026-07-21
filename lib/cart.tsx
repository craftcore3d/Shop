"use client";

/**
 * Cart context — localStorage persistence + Shopify Cart API integration.
 *
 * Shopify Cart API is used when NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and
 * SHOPIFY_STOREFRONT_ACCESS_TOKEN are present in .env.local.
 * Falls back to pure localStorage otherwise.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export type CartItem = {
  /** Unique line ID (cart-level, not product ID) */
  lineId: string;
  productId: string;
  handle: string;
  name: string;
  price: number;
  image: string;
  selectedColor: string;
  category: string;
  quantity: number;
};

export type Coupon = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  label: string;
};

type CartState = {
  items: CartItem[];
  coupon: Coupon | null;
  /** Shopify Cart gid — null when Shopify is not configured */
  shopifyCartId: string | null;
};

type CartAction =
  | { type: "SET_ITEMS"; items: CartItem[] }
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; lineId: string }
  | { type: "UPDATE_QTY"; lineId: string; quantity: number }
  | { type: "APPLY_COUPON"; coupon: Coupon }
  | { type: "REMOVE_COUPON" }
  | { type: "SET_SHOPIFY_CART_ID"; id: string }
  | { type: "CLEAR" };

export type CartContextValue = {
  items: CartItem[];
  coupon: Coupon | null;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  checkoutUrl: string | null;
  addItem: (item: Omit<CartItem, "lineId">) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
};

/* ─────────────────────────────────────────────
   Mock coupon codes
───────────────────────────────────────────── */
const VALID_COUPONS: Record<string, Coupon> = {
  CRAFTCORE10: { code: "CRAFTCORE10", type: "percentage", value: 10, label: "10% off your order" },
  WELCOME15:   { code: "WELCOME15",   type: "percentage", value: 15, label: "15% welcome discount" },
  SAVE20:      { code: "SAVE20",      type: "fixed",      value: 20, label: "CAD $20 off" },
};

/* ─────────────────────────────────────────────
   Reducer
───────────────────────────────────────────── */
function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.items };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.productId === action.item.productId && i.selectedColor === action.item.selectedColor
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.lineId === existing.lineId
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.lineId !== action.lineId) };

    case "UPDATE_QTY":
      if (action.quantity < 1) {
        return { ...state, items: state.items.filter((i) => i.lineId !== action.lineId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.lineId === action.lineId ? { ...i, quantity: action.quantity } : i
        ),
      };

    case "APPLY_COUPON":
      return { ...state, coupon: action.coupon };

    case "REMOVE_COUPON":
      return { ...state, coupon: null };

    case "SET_SHOPIFY_CART_ID":
      return { ...state, shopifyCartId: action.id };

    case "CLEAR":
      return { items: [], coupon: null, shopifyCartId: null };

    default:
      return state;
  }
}

/* ─────────────────────────────────────────────
   Shopify Cart API helpers
───────────────────────────────────────────── */
const CART_CREATE = /* GraphQL */ `
  mutation cartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
    }
  }
`;

const CART_LINES_ADD = /* GraphQL */ `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
    }
  }
`;

const CART_LINES_UPDATE = /* GraphQL */ `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
    }
  }
`;

const CART_LINES_REMOVE = /* GraphQL */ `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
    }
  }
`;

const CART_DISCOUNT_UPDATE = /* GraphQL */ `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { id }
    }
  }
`;

async function shopifyCartFetch<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T | null> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return null;

  try {
    const res = await fetch(`https://${domain}/api/2024-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = (await res.json()) as { data: T };
    return json.data;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */
const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "craftcore_cart_v1";

function loadFromStorage(): CartState {
  if (typeof window === "undefined") return { items: [], coupon: null, shopifyCartId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], coupon: null, shopifyCartId: null };
    return JSON.parse(raw) as CartState;
  } catch {
    return { items: [], coupon: null, shopifyCartId: null };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], coupon: null, shopifyCartId: null });
  const checkoutUrlRef = useRef<string | null>(null);
  const hydrated = useRef(false);

  /* Hydrate from localStorage after first mount to avoid SSR mismatch */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadFromStorage();
    if (saved.items.length > 0 || saved.coupon || saved.shopifyCartId) {
      dispatch({ type: "SET_ITEMS", items: saved.items });
      if (saved.coupon) dispatch({ type: "APPLY_COUPON", coupon: saved.coupon });
      if (saved.shopifyCartId) dispatch({ type: "SET_SHOPIFY_CART_ID", id: saved.shopifyCartId });
    }
  }, []);

  /* Persist to localStorage whenever cart changes */
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage quota exceeded — silently ignore
    }
  }, [state]);

  /* ── Derived values ── */
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const discountAmount = state.coupon
    ? state.coupon.type === "percentage"
      ? (subtotal * state.coupon.value) / 100
      : Math.min(state.coupon.value, subtotal)
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  /* ── Actions ── */
  const addItem = useCallback(
    async (item: Omit<CartItem, "lineId">) => {
      const lineId = `${item.productId}-${item.selectedColor}-${Date.now()}`;
      dispatch({ type: "ADD_ITEM", item: { ...item, lineId } });

      // Shopify Cart API
      if (!state.shopifyCartId) {
        const data = await shopifyCartFetch<{
          cartCreate: { cart: { id: string; checkoutUrl: string } };
        }>(CART_CREATE, {
          lines: [{ merchandiseId: item.productId, quantity: item.quantity }],
        });
        if (data?.cartCreate.cart) {
          dispatch({ type: "SET_SHOPIFY_CART_ID", id: data.cartCreate.cart.id });
          checkoutUrlRef.current = data.cartCreate.cart.checkoutUrl;
        }
      } else {
        await shopifyCartFetch(CART_LINES_ADD, {
          cartId: state.shopifyCartId,
          lines: [{ merchandiseId: item.productId, quantity: item.quantity }],
        });
      }
    },
    [state.shopifyCartId]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      dispatch({ type: "REMOVE_ITEM", lineId });
      if (state.shopifyCartId) {
        await shopifyCartFetch(CART_LINES_REMOVE, {
          cartId: state.shopifyCartId,
          lineIds: [lineId],
        });
      }
    },
    [state.shopifyCartId]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      dispatch({ type: "UPDATE_QTY", lineId, quantity });
      if (state.shopifyCartId) {
        await shopifyCartFetch(CART_LINES_UPDATE, {
          cartId: state.shopifyCartId,
          lines: [{ id: lineId, quantity }],
        });
      }
    },
    [state.shopifyCartId]
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const applyCoupon = useCallback((code: string): { ok: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const coupon = VALID_COUPONS[trimmed];
    if (!coupon) return { ok: false, message: "Invalid or expired coupon code." };

    dispatch({ type: "APPLY_COUPON", coupon });

    if (state.shopifyCartId) {
      shopifyCartFetch(CART_DISCOUNT_UPDATE, {
        cartId: state.shopifyCartId,
        discountCodes: [trimmed],
      });
    }

    return { ok: true, message: `${coupon.label} applied!` };
  }, [state.shopifyCartId]);

  const removeCoupon = useCallback(() => dispatch({ type: "REMOVE_COUPON" }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        coupon: state.coupon,
        itemCount,
        subtotal,
        discountAmount,
        total,
        checkoutUrl: checkoutUrlRef.current,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
