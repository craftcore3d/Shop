/**
 * Shopify Checkout + Order utilities
 *
 * Required env vars (.env.local):
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
 *   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-token          (server-side only)
 *   SHOPIFY_WEBHOOK_SECRET=your-webhook-secret           (server-side only)
 *   SHOPIFY_ORDER_CONFIRMATION_URL=https://yoursite.com/order-confirmation
 *
 * Email (choose one):
 *   EMAIL_PROVIDER=resend | sendgrid | smtp
 *   RESEND_API_KEY=re_...
 *   SENDGRID_API_KEY=SG.xxx
 */

import type { CartItem } from "./cart";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export type OrderLineItem = {
  title: string;
  quantity: number;
  price: number;
  currency: string;
};

export type OrderAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  province: string;
  zip: string;
  country: string;
};

export type ShopifyOrder = {
  id: string;
  name: string; // e.g. "#1001"
  email: string;
  createdAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  lineItems: OrderLineItem[];
  shippingAddress: OrderAddress | null;
  subtotalPrice: number;
  totalShippingPrice: number;
  totalTax: number;
  totalPrice: number;
  currency: string;
  trackingNumbers: string[];
  trackingUrls: string[];
  estimatedDelivery: string | null;
};

/* ─────────────────────────────────────────────
   GraphQL helpers
───────────────────────────────────────────── */
const STOREFRONT_CART_CREATE = /* GraphQL */ `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors { field message }
    }
  }
`;

const STOREFRONT_CART_LINES_ADD = /* GraphQL */ `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

async function storefrontFetch<T>(
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
   Create Shopify checkout URL from cart items
───────────────────────────────────────────── */
export async function createCheckoutUrl(items: CartItem[]): Promise<string | null> {
  if (items.length === 0) return null;

  const lines = items.map((item) => ({
    merchandiseId: item.productId.startsWith("gid://")
      ? item.productId
      : `gid://shopify/ProductVariant/${item.productId}`,
    quantity: item.quantity,
    attributes: item.selectedColor
      ? [{ key: "Colour", value: item.selectedColor }]
      : [],
  }));

  const confirmationUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation`
      : undefined;

  const data = await storefrontFetch<{
    cartCreate: { cart: { id: string; checkoutUrl: string } | null };
  }>(STOREFRONT_CART_CREATE, {
    input: {
      lines,
      ...(confirmationUrl && { buyerIdentity: {} }),
      attributes: confirmationUrl
        ? [{ key: "_return_to", value: confirmationUrl }]
        : [],
    },
  });

  return data?.cartCreate.cart?.checkoutUrl ?? null;
}

/* ─────────────────────────────────────────────
   Add lines to existing Shopify cart
───────────────────────────────────────────── */
export async function addLinesToCart(
  cartId: string,
  items: CartItem[]
): Promise<string | null> {
  const lines = items.map((item) => ({
    merchandiseId: item.productId.startsWith("gid://")
      ? item.productId
      : `gid://shopify/ProductVariant/${item.productId}`,
    quantity: item.quantity,
  }));

  const data = await storefrontFetch<{
    cartLinesAdd: { cart: { checkoutUrl: string } | null };
  }>(STOREFRONT_CART_LINES_ADD, { cartId, lines });

  return data?.cartLinesAdd.cart?.checkoutUrl ?? null;
}

/* ─────────────────────────────────────────────
   Fetch order by ID (Admin API — server-side only)
───────────────────────────────────────────── */
const ORDER_QUERY = /* GraphQL */ `
  query getOrder($id: ID!) {
    order(id: $id) {
      id
      name
      email
      createdAt
      displayFulfillmentStatus
      displayFinancialStatus
      lineItems(first: 20) {
        edges {
          node {
            title
            quantity
            originalUnitPriceSet { shopMoney { amount currencyCode } }
          }
        }
      }
      shippingAddress {
        firstName lastName address1 city province zip country
      }
      subtotalPriceSet { shopMoney { amount currencyCode } }
      totalShippingPriceSet { shopMoney { amount currencyCode } }
      currentTotalTaxSet { shopMoney { amount currencyCode } }
      totalPriceSet { shopMoney { amount currencyCode } }
      fulfillments(first: 5) {
        trackingInfo { number url }
        estimatedDeliveryAt
      }
    }
  }
`;

export async function fetchOrder(orderId: string): Promise<ShopifyOrder | null> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token) return null;

  const gid = orderId.startsWith("gid://")
    ? orderId
    : `gid://shopify/Order/${orderId}`;

  try {
    const res = await fetch(`https://${domain}/admin/api/2024-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query: ORDER_QUERY, variables: { id: gid } }),
      next: { revalidate: 30 },
    });

    type RawOrder = {
      id: string;
      name: string;
      email: string;
      createdAt: string;
      displayFulfillmentStatus: string;
      displayFinancialStatus: string;
      lineItems: {
        edges: {
          node: {
            title: string;
            quantity: number;
            originalUnitPriceSet: { shopMoney: { amount: string; currencyCode: string } };
          };
        }[];
      };
      shippingAddress: OrderAddress | null;
      subtotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
      totalShippingPriceSet: { shopMoney: { amount: string; currencyCode: string } };
      currentTotalTaxSet: { shopMoney: { amount: string; currencyCode: string } };
      totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
      fulfillments: {
        trackingInfo: { number: string; url: string }[];
        estimatedDeliveryAt: string | null;
      }[];
    };

    const json = (await res.json()) as { data: { order: RawOrder | null } };
    const o = json.data?.order;
    if (!o) return null;

    const currency = o.totalPriceSet.shopMoney.currencyCode;
    const allTracking = o.fulfillments.flatMap((f) => f.trackingInfo);

    return {
      id: o.id,
      name: o.name,
      email: o.email,
      createdAt: o.createdAt,
      fulfillmentStatus: o.displayFulfillmentStatus,
      financialStatus: o.displayFinancialStatus,
      lineItems: o.lineItems.edges.map(({ node }) => ({
        title: node.title,
        quantity: node.quantity,
        price: parseFloat(node.originalUnitPriceSet.shopMoney.amount),
        currency,
      })),
      shippingAddress: o.shippingAddress,
      subtotalPrice: parseFloat(o.subtotalPriceSet.shopMoney.amount),
      totalShippingPrice: parseFloat(o.totalShippingPriceSet.shopMoney.amount),
      totalTax: parseFloat(o.currentTotalTaxSet.shopMoney.amount),
      totalPrice: parseFloat(o.totalPriceSet.shopMoney.amount),
      currency,
      trackingNumbers: allTracking.map((t) => t.number).filter(Boolean),
      trackingUrls: allTracking.map((t) => t.url).filter(Boolean),
      estimatedDelivery:
        o.fulfillments[0]?.estimatedDeliveryAt ?? null,
    };
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────
   Webhook HMAC-SHA256 verification
───────────────────────────────────────────── */
export async function verifyWebhookHmac(
  rawBody: string,
  shopifyHmacHeader: string
): Promise<boolean> {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computed = Buffer.from(sig).toString("base64");
  return computed === shopifyHmacHeader;
}

/* ─────────────────────────────────────────────
   Confirmation email (provider-agnostic)
───────────────────────────────────────────── */
export type EmailPayload = {
  to: string;
  orderName: string;
  lineItems: OrderLineItem[];
  shippingAddress: OrderAddress | null;
  totalPrice: number;
  currency: string;
  trackingNumbers: string[];
  trackingUrls: string[];
  estimatedDelivery: string | null;
};

function buildEmailHtml(p: EmailPayload): string {
  const CAD = (n: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: p.currency }).format(n);

  const itemsHtml = p.lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-size:14px;color:#333;">
          ${item.title} × ${item.quantity}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-size:14px;color:#CF7D65;text-align:right;">
          ${CAD(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const addr = p.shippingAddress;
  const addressHtml = addr
    ? `${addr.firstName} ${addr.lastName}<br>${addr.address1}<br>${addr.city}, ${addr.province} ${addr.zip}<br>${addr.country}`
    : "—";

  const trackingHtml =
    p.trackingNumbers.length > 0
      ? p.trackingNumbers
          .map(
            (num, i) =>
              `<a href="${p.trackingUrls[i] ?? "#"}" style="color:#CF7D65;">${num}</a>`
          )
          .join(", ")
      : "Will be provided once your order ships.";

  const eta = p.estimatedDelivery
    ? new Date(p.estimatedDelivery).toLocaleDateString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "5–8 business days";

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2DEC7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="background:#6B6D43;padding:32px 40px;">
      <p style="margin:0;color:#ABA66F;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">CraftCore</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:700;">Order Confirmed</h1>
      <p style="margin:4px 0 0;color:#E1B8A2;font-size:14px;">${p.orderName}</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#555;font-size:14px;line-height:1.6;">
        Thank you for your order! We're getting it ready and will notify you when it ships.
      </p>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#6B6D43;">Total</td>
          <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#CF7D65;text-align:right;">${CAD(p.totalPrice)}</td>
        </tr>
      </table>

      <hr style="border:none;border-top:1px solid #f0ece4;margin:24px 0;">

      <!-- Shipping -->
      <h2 style="margin:0 0 12px;font-size:15px;color:#6B6D43;">Shipping to</h2>
      <p style="margin:0;font-size:13px;color:#555;line-height:1.7;">${addressHtml}</p>

      <hr style="border:none;border-top:1px solid #f0ece4;margin:24px 0;">

      <!-- Tracking -->
      <h2 style="margin:0 0 8px;font-size:15px;color:#6B6D43;">Tracking</h2>
      <p style="margin:0 0 4px;font-size:13px;color:#555;">${trackingHtml}</p>
      <p style="margin:0;font-size:12px;color:#999;">Estimated delivery: ${eta}</p>

      <hr style="border:none;border-top:1px solid #f0ece4;margin:24px 0;">

      <!-- Support -->
      <p style="margin:0;font-size:13px;color:#555;">
        Questions? Reply to this email or contact us at
        <a href="mailto:support@craftcore.ca" style="color:#CF7D65;">support@craftcore.ca</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8f5ef;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#999;">© ${new Date().getFullYear()} CraftCore. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendConfirmationEmail(payload: EmailPayload): Promise<void> {
  const html = buildEmailHtml(payload);
  const provider = process.env.EMAIL_PROVIDER ?? "resend";

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "CraftCore <orders@craftcore.ca>",
        to: payload.to,
        subject: `Your CraftCore order ${payload.orderName} is confirmed`,
        html,
      }),
    });
  } else if (provider === "sendgrid") {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) return;
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: "orders@craftcore.ca", name: "CraftCore" },
        subject: `Your CraftCore order ${payload.orderName} is confirmed`,
        content: [{ type: "text/html", value: html }],
      }),
    });
  }
  // Add smtp/other providers here as needed
}
