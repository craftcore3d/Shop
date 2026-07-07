import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookHmac, sendConfirmationEmail } from "@/lib/checkout";

/**
 * Shopify webhook endpoint for order.created events.
 *
 * Setup in Shopify Admin → Settings → Notifications → Webhooks:
 *   Event:   Orders / Creation
 *   URL:     https://yoursite.com/api/webhooks/shopify
 *   Format:  JSON
 *
 * Copy the "Signing secret" shown after saving and set it as
 * SHOPIFY_WEBHOOK_SECRET in .env.local.
 */

type ShopifyOrderWebhookPayload = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  fulfillment_status: string | null;
  financial_status: string;
  line_items: {
    id: number;
    title: string;
    quantity: number;
    price: string;
  }[];
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  } | null;
  subtotal_price: string;
  total_shipping_price_set: {
    shop_money: { amount: string; currency_code: string };
  };
  total_tax: string;
  total_price: string;
  currency: string;
  fulfillments: {
    tracking_number: string | null;
    tracking_url: string | null;
    tracking_numbers: string[];
    tracking_urls: string[];
  }[];
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const topic = request.headers.get("x-shopify-topic") ?? "";

  /* ── 1. Verify HMAC signature ── */
  const isValid = await verifyWebhookHmac(rawBody, hmacHeader);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ── 2. Route by topic ── */
  if (topic === "orders/create") {
    let payload: ShopifyOrderWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as ShopifyOrderWebhookPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    /* ── 3. Build email payload ── */
    const trackingNumbers = payload.fulfillments.flatMap(
      (f) => f.tracking_numbers ?? (f.tracking_number ? [f.tracking_number] : [])
    );
    const trackingUrls = payload.fulfillments.flatMap(
      (f) => f.tracking_urls ?? (f.tracking_url ? [f.tracking_url] : [])
    );

    const addr = payload.shipping_address;

    await sendConfirmationEmail({
      to: payload.email,
      orderName: payload.name,
      lineItems: payload.line_items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        currency: payload.currency,
      })),
      shippingAddress: addr
        ? {
            firstName: addr.first_name,
            lastName: addr.last_name,
            address1: addr.address1,
            city: addr.city,
            province: addr.province,
            zip: addr.zip,
            country: addr.country,
          }
        : null,
      totalPrice: parseFloat(payload.total_price),
      currency: payload.currency,
      trackingNumbers,
      trackingUrls,
      estimatedDelivery: null,
    });

    return NextResponse.json({ received: true });
  }

  /* ── Unknown topic — acknowledge without action ── */
  return NextResponse.json({ received: true });
}
