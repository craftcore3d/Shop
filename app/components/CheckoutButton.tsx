"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { createCheckoutUrl } from "@/lib/checkout";

/* ─────────────────────────────────────────────
   Payment method badge icons (SVG paths)
───────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    name: "Visa",
    color: "#1A1F71",
    logo: (
      <svg viewBox="0 0 48 16" className="h-4 w-auto" fill="none">
        <text x="0" y="13" fontFamily="Arial" fontSize="13" fontWeight="bold" fill="#1A1F71">VISA</text>
      </svg>
    ),
  },
  {
    name: "Mastercard",
    logo: (
      <svg viewBox="0 0 38 24" className="h-5 w-auto">
        <circle cx="14" cy="12" r="10" fill="#EB001B" />
        <circle cx="24" cy="12" r="10" fill="#F79E1B" />
        <path d="M19 5.8A10 10 0 0124 12a10 10 0 01-5 6.2A10 10 0 0114 12a10 10 0 015-6.2z" fill="#FF5F00" />
      </svg>
    ),
  },
  {
    name: "Amex",
    logo: (
      <svg viewBox="0 0 48 16" className="h-4 w-auto">
        <text x="0" y="13" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="#2E77BC">AMEX</text>
      </svg>
    ),
  },
  {
    name: "Apple Pay",
    logo: (
      <svg viewBox="0 0 48 20" className="h-5 w-auto" fill="none">
        <text x="0" y="15" fontFamily="-apple-system,sans-serif" fontSize="12" fontWeight="600" fill="#000">
          &#xF8FF; Pay
        </text>
      </svg>
    ),
  },
  {
    name: "Google Pay",
    logo: (
      <svg viewBox="0 0 56 22" className="h-5 w-auto" fill="none">
        <text x="0" y="16" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#5F6368">G</text>
        <text x="10" y="16" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#EA4335">o</text>
        <text x="19" y="16" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#4285F4">o</text>
        <text x="28" y="16" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#34A853">g</text>
        <text x="37" y="16" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#FBBC05">l</text>
        <text x="43" y="16" fontFamily="Arial" fontSize="12" fontWeight="500" fill="#EA4335">e Pay</text>
      </svg>
    ),
  },
  {
    name: "PayPal",
    logo: (
      <svg viewBox="0 0 52 14" className="h-4 w-auto" fill="none">
        <text x="0" y="12" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#003087">Pay</text>
        <text x="24" y="12" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#009CDE">Pal</text>
      </svg>
    ),
  },
] as const;

/* ─────────────────────────────────────────────
   Validation
───────────────────────────────────────────── */
type ValidationError = { field: string; message: string };

function validateCart(
  items: ReturnType<typeof useCart>["items"],
  subtotal: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (items.length === 0) {
    errors.push({ field: "cart", message: "Your cart is empty." });
  }

  const invalidQty = items.find((i) => i.quantity < 1 || !Number.isInteger(i.quantity));
  if (invalidQty) {
    errors.push({
      field: "quantity",
      message: `Invalid quantity for "${invalidQty.name}". Please update your cart.`,
    });
  }

  if (subtotal <= 0) {
    errors.push({ field: "subtotal", message: "Order total must be greater than zero." });
  }

  return errors;
}

/* ─────────────────────────────────────────────
   CheckoutButton
───────────────────────────────────────────── */
type Props = {
  grandTotal: number;
  className?: string;
};

export default function CheckoutButton({ grandTotal, className }: Props) {
  const { items, subtotal, checkoutUrl } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

  const handleCheckout = async () => {
    setErrors([]);

    // 1. Validate cart
    const validationErrors = validateCart(items, subtotal);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 2. Use existing Shopify checkout URL if available, otherwise create one
      let url = checkoutUrl;

      if (!url) {
        url = await createCheckoutUrl(items);
      }

      if (url) {
        // 3. Redirect to Shopify hosted checkout (handles all payment methods)
        window.location.href = url;
      } else {
        // Shopify not configured — show informative message
        setErrors([
          {
            field: "shopify",
            message:
              "Connect your Shopify store to enable checkout. Add NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN to .env.local.",
          },
        ]);
      }
    } catch {
      setErrors([
        {
          field: "network",
          message: "Something went wrong starting checkout. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = errors.length > 0;
  const isEmpty = items.length === 0;

  return (
    <div className="space-y-3">
      {/* Validation errors */}
      {hasErrors && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
          {errors.map((e) => (
            <p key={e.field}>{e.message}</p>
          ))}
        </div>
      )}

      {/* Checkout button */}
      <button
        onClick={handleCheckout}
        disabled={isLoading || isEmpty}
        className={`relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-sm font-bold uppercase tracking-widest text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
          className ?? "bg-[#6B6D43] hover:bg-[#4f5236]"
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                d="M12 3v3M21 12h-3M12 21v-3M3 12h3"
                opacity={0.3}
              />
              <path strokeLinecap="round" d="M16.24 7.76l-2.12 2.12" />
            </svg>
            Redirecting to checkout…
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Secure Checkout · {CAD.format(grandTotal)}
          </>
        )}
      </button>

      {/* Payment methods */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {PAYMENT_METHODS.map(({ name, logo }) => (
          <div
            key={name}
            title={name}
            className="flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 shadow-sm"
          >
            {logo}
          </div>
        ))}
      </div>

      {/* Security line */}
      <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
        <svg viewBox="0 0 20 20" className="h-3 w-3 text-[#ABA66F]" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        SSL-encrypted · Powered by Shopify
      </p>
    </div>
  );
}
