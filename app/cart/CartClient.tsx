"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import type { ProductListItem } from "@/lib/shopify";
import CheckoutButton from "@/app/components/CheckoutButton";

/* ─────────────────────────────────────────────
   Canadian tax rates by province
───────────────────────────────────────────── */
const PROVINCE_TAX: Record<string, { label: string; rate: number }> = {
  AB: { label: "Alberta (GST 5%)",          rate: 0.05 },
  BC: { label: "British Columbia (GST+PST)", rate: 0.12 },
  MB: { label: "Manitoba (GST+PST)",         rate: 0.12 },
  NB: { label: "New Brunswick (HST 15%)",    rate: 0.15 },
  NL: { label: "Newfoundland (HST 15%)",     rate: 0.15 },
  NS: { label: "Nova Scotia (HST 15%)",      rate: 0.15 },
  NT: { label: "Northwest Territories (GST)",rate: 0.05 },
  NU: { label: "Nunavut (GST 5%)",           rate: 0.05 },
  ON: { label: "Ontario (HST 13%)",          rate: 0.13 },
  PE: { label: "Prince Edward Island (HST)", rate: 0.15 },
  QC: { label: "Québec (GST+QST)",          rate: 0.14975 },
  SK: { label: "Saskatchewan (GST+PST)",    rate: 0.11 },
  YT: { label: "Yukon (GST 5%)",            rate: 0.05 },
};

const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

/* ─────────────────────────────────────────────
   Shipping calculation
───────────────────────────────────────────── */
const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING = 9.99;

function getShipping(subtotal: number): { label: string; cost: number } {
  if (subtotal >= FREE_SHIPPING_THRESHOLD)
    return { label: "Free shipping", cost: 0 };
  return { label: "Standard shipping", cost: STANDARD_SHIPPING };
}

/* ─────────────────────────────────────────────
   Quantity stepper
───────────────────────────────────────────── */
function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex h-8 w-24 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
      <button
        onClick={() => onChange(value - 1)}
        className="flex w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 active:bg-slate-100"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="flex flex-1 items-center justify-center font-semibold text-[#6B6D43]">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 active:bg-slate-100"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Coupon input
───────────────────────────────────────────── */
function CouponInput() {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-[#ABA66F]/40 bg-[#ABA66F]/10 px-4 py-2.5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#6B6D43]">
            {coupon.code}
          </p>
          <p className="text-xs text-slate-500">{coupon.label}</p>
        </div>
        <button
          onClick={removeCoupon}
          className="text-xs font-semibold text-[#CF7D65] hover:underline"
        >
          Remove
        </button>
      </div>
    );
  }

  const handleApply = () => {
    const result = applyCoupon(value);
    setFeedback(result);
    if (result.ok) setValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setFeedback(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Coupon code"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-[#6B6D43] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/40"
        />
        <button
          onClick={handleApply}
          disabled={!value.trim()}
          className="rounded-xl border border-[#6B6D43] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#6B6D43] transition hover:bg-[#6B6D43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply
        </button>
      </div>
      {feedback && (
        <p className={`text-xs font-medium ${feedback.ok ? "text-[#ABA66F]" : "text-[#CF7D65]"}`}>
          {feedback.message}
        </p>
      )}
      <p className="text-[10px] text-slate-400">Try: CRAFTCORE10 · WELCOME15 · SAVE20</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Empty cart
───────────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl bg-white py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F2DEC7]">
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 text-[#CF7D65]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#6B6D43]">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-400">
          Looks like you haven&apos;t added anything yet.
        </p>
      </div>
      <Link
        href="/shop"
        className="rounded-2xl bg-[#6B6D43] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#4f5236]"
      >
        Browse Products
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Recommended products strip
───────────────────────────────────────────── */
function Recommendations({ cartProductIds, products }: { cartProductIds: string[]; products: ProductListItem[] }) {
  const { addItem } = useCart();
  const recs = products.filter((p) => !cartProductIds.includes(p.id)).slice(0, 4);

  if (recs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-5 text-xl font-bold text-[#6B6D43]">You might also like</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {recs.map((product) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Link href={`/shop/${product.id}`}>
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.badge && (
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white ${
                      product.badge === "New" ? "bg-[#99B4AA]" : "bg-[#CF7D65]"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/shop/${product.id}`}>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  {product.category}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800 hover:text-[#6B6D43]">
                  {product.name}
                </p>
              </Link>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-bold text-[#CF7D65]">
                  {CAD.format(product.price)}
                </p>
                <button
                  onClick={() =>
                    addItem({
                      productId: product.variantId || product.id,
                      handle: product.handle,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      selectedColor: "",
                      category: product.category,
                      quantity: 1,
                    })
                  }
                  className="rounded-lg bg-[#6B6D43]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6D43] transition hover:bg-[#6B6D43] hover:text-white"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Cart page
───────────────────────────────────────────── */
export default function CartPage({ recommendedProducts }: { recommendedProducts: ProductListItem[] }) {
  const { items, coupon, itemCount, subtotal, discountAmount, total, removeItem, updateQuantity } =
    useCart();
  const [province, setProvince] = useState("ON");

  const shipping = getShipping(subtotal);
  const tax = (total + shipping.cost) * PROVINCE_TAX[province].rate;
  const grandTotal = total + shipping.cost + tax;
  const cartProductIds = items.map((i) => i.productId);

  return (
    <main className="min-h-screen bg-[#F2DEC7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#ABA66F]">CraftCore</p>
            <h1 className="mt-1 text-3xl font-bold text-[#6B6D43]">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-3 rounded-full bg-[#CF7D65] px-2.5 py-0.5 text-sm font-bold text-white">
                  {itemCount}
                </span>
              )}
            </h1>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-semibold text-[#6B6D43] hover:text-[#CF7D65]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            {/* ── Cart items ── */}
            <div className="space-y-4">
              {/* Column headers — desktop only */}
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 rounded-xl bg-white/60 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 lg:grid">
                <span>Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-center">Total</span>
                <span />
              </div>

              {items.map((item) => (
                <div
                  key={item.lineId}
                  className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 sm:grid-cols-[auto_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center lg:px-5 lg:py-4"
                >
                  {/* Image + name */}
                  <div className="flex items-center gap-4 sm:col-span-1 lg:col-span-1">
                    <Link href={`/shop/${item.productId}`} className="shrink-0">
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[#F8F5EF]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/shop/${item.productId}`}
                        className="block truncate font-semibold text-[#6B6D43] hover:text-[#CF7D65]"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-400">{item.category}</p>
                      {item.selectedColor && (
                        <p className="mt-1 text-xs text-slate-500">
                          Colour:{" "}
                          <span className="font-semibold text-[#6B6D43]">{item.selectedColor}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price per unit */}
                  <div className="flex items-center justify-between lg:justify-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 lg:hidden">
                      Price
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {CAD.format(item.price)}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between lg:justify-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 lg:hidden">
                      Qty
                    </span>
                    <Stepper
                      value={item.quantity}
                      onChange={(n) => updateQuantity(item.lineId, n)}
                    />
                  </div>

                  {/* Line total */}
                  <div className="flex items-center justify-between lg:justify-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 lg:hidden">
                      Total
                    </span>
                    <span className="text-sm font-bold text-[#CF7D65]">
                      {CAD.format(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove */}
                  <div className="flex justify-end lg:justify-center">
                    <button
                      onClick={() => removeItem(item.lineId)}
                      aria-label={`Remove ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                    >
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Free shipping progress bar */}
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="rounded-2xl border border-dashed border-[#ABA66F]/40 bg-white/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#6B6D43]">
                    <span>Add {CAD.format(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping</span>
                    <span className="text-[#ABA66F]">
                      {CAD.format(subtotal)} / {CAD.format(FREE_SHIPPING_THRESHOLD)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#ABA66F] transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Order summary ── */}
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-2xl bg-white p-6">
                <h2 className="mb-5 text-lg font-bold text-[#6B6D43]">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="font-semibold">{CAD.format(subtotal)}</span>
                  </div>

                  {coupon && discountAmount > 0 && (
                    <div className="flex justify-between text-[#ABA66F]">
                      <span>Discount ({coupon.code})</span>
                      <span className="font-semibold">−{CAD.format(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>{shipping.label}</span>
                    <span className="font-semibold">
                      {shipping.cost === 0 ? (
                        <span className="text-[#ABA66F]">Free</span>
                      ) : (
                        CAD.format(shipping.cost)
                      )}
                    </span>
                  </div>

                  {/* Province selector for tax */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <label htmlFor="province" className="text-xs font-semibold text-slate-400">
                      Estimate tax for province
                    </label>
                    <select
                      id="province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#6B6D43] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/40"
                    >
                      {Object.entries(PROVINCE_TAX).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({(PROVINCE_TAX[province].rate * 100).toFixed(3).replace(/\.?0+$/, "")}%)</span>
                      <span className="font-semibold">≈ {CAD.format(tax)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-[#6B6D43]">
                    <span>Total</span>
                    <span className="text-[#CF7D65]">{CAD.format(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="rounded-2xl bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-[#6B6D43]">Discount code</p>
                <CouponInput />
              </div>

              {/* Checkout button — handles validation, payment methods, Shopify redirect */}
              <CheckoutButton grandTotal={grandTotal} />

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Secure" },
                  { icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99", label: "30-day returns" },
                  { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Safe payment" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-white/60 p-3">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ABA66F]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                    <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <Recommendations cartProductIds={cartProductIds} products={recommendedProducts} />
      </div>
    </main>
  );
}
