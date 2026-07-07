import Link from "next/link";
import { fetchOrder } from "@/lib/checkout";
import type { ShopifyOrder } from "@/lib/checkout";
import OrderConfirmationClient from "./OrderConfirmationClient";

/* ─────────────────────────────────────────────
   Shopify redirects here after checkout with:
     ?order_id=<numeric-id>
     ?order_number=<display-number>   (e.g. 1001)
     ?name=<customer-first-name>
     ?email=<customer-email>
     &key=<order-token>               (for security)

   Configure in Shopify Admin → Settings → Checkout
   → Order status page → Additional scripts, or
   via the "Thank you" page redirect URL.
───────────────────────────────────────────── */

interface Props {
  searchParams: Promise<{
    order_id?: string;
    order_number?: string;
    name?: string;
    email?: string;
    key?: string;
  }>;
}

export const metadata = {
  title: "Order Confirmed — CraftCore",
  description: "Thank you for your order with CraftCore.",
};

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const { order_id, order_number, name, email } = params;

  // Try to fetch full order data from Shopify Admin API (server-side, safe)
  let order: ShopifyOrder | null = null;
  if (order_id) {
    order = await fetchOrder(order_id);
  }

  const displayNumber = order?.name ?? (order_number ? `#${order_number}` : null);
  const customerName = name ?? order?.email?.split("@")[0] ?? "there";
  const customerEmail = email ?? order?.email;

  return (
    <main className="min-h-screen bg-[#F2DEC7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Success header */}
        <div className="rounded-3xl bg-white p-8 text-center">
          {/* Animated checkmark */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#6B6D43]/10">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-[#6B6D43]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <p className="text-xs uppercase tracking-widest text-[#ABA66F]">
            Order confirmed
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#6B6D43]">
            Thank you, {customerName}!
          </h1>
          {displayNumber && (
            <p className="mt-2 text-lg font-semibold text-[#CF7D65]">{displayNumber}</p>
          )}
          {customerEmail && (
            <p className="mt-2 text-sm text-slate-500">
              A confirmation has been sent to{" "}
              <span className="font-semibold text-[#6B6D43]">{customerEmail}</span>
            </p>
          )}
        </div>

        {/* Order details — rendered client-side so we can clear the cart */}
        <OrderConfirmationClient order={order} />

        {/* Shipping & tracking */}
        {order ? (
          <div className="rounded-3xl bg-white p-6 space-y-5">
            <h2 className="font-bold text-[#6B6D43]">Shipping details</h2>

            {order.shippingAddress && (
              <div className="text-sm text-slate-600 leading-relaxed">
                <p className="font-semibold text-[#6B6D43]">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            )}

            <div className="h-px bg-slate-100" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-[#6B6D43]">Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest ${
                    order.fulfillmentStatus === "FULFILLED"
                      ? "bg-[#ABA66F]/20 text-[#6B6D43]"
                      : "bg-[#E1B8A2]/40 text-[#CF7D65]"
                  }`}
                >
                  {order.fulfillmentStatus.replace(/_/g, " ")}
                </span>
              </div>

              {order.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="font-semibold text-[#6B6D43]">Est. delivery</span>
                  <span className="text-slate-600">
                    {new Date(order.estimatedDelivery).toLocaleDateString("en-CA", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {!order.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="font-semibold text-[#6B6D43]">Est. delivery</span>
                  <span className="text-slate-600">5–8 business days</span>
                </div>
              )}
            </div>

            {order.trackingNumbers.length > 0 && (
              <>
                <div className="h-px bg-slate-100" />
                <div>
                  <p className="mb-2 font-semibold text-[#6B6D43] text-sm">Tracking</p>
                  <div className="space-y-1.5">
                    {order.trackingNumbers.map((num, i) => (
                      <a
                        key={num}
                        href={order.trackingUrls[i] ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-semibold text-[#CF7D65] hover:underline"
                      >
                        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        {num}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {order.trackingNumbers.length === 0 && (
              <p className="text-xs text-slate-400">
                Tracking will be emailed to you once your order ships.
              </p>
            )}
          </div>
        ) : (
          /* Fallback shipping info when no Admin API */
          <div className="rounded-3xl bg-white p-6 space-y-3">
            <h2 className="font-bold text-[#6B6D43]">What happens next?</h2>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  title: "Confirmation email",
                  desc: "Check your inbox for a full order summary.",
                },
                {
                  step: "2",
                  title: "Production",
                  desc: "We start printing your order within 1–2 business days.",
                },
                {
                  step: "3",
                  title: "Shipping",
                  desc: "Delivery within 5–8 business days. Free over CAD $75.",
                },
                {
                  step: "4",
                  title: "Tracking",
                  desc: "You'll receive a tracking number by email once shipped.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#CF7D65] text-xs font-bold text-white">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#6B6D43]">{title}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer support */}
        <div className="rounded-3xl border border-[#E1B8A2]/50 bg-white/70 p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-[#6B6D43]">Need help?</p>
          <p className="text-xs text-slate-500">
            Our team is happy to assist Monday–Friday, 9 am–6 pm ET.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <a
              href="mailto:support@craftcore.ca"
              className="flex items-center gap-1.5 text-[#CF7D65] hover:underline"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              support@craftcore.ca
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#6B6D43] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#4f5236]"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-[#6B6D43] transition hover:border-[#CF7D65]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
