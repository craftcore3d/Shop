"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import type { ShopifyOrder } from "@/lib/checkout";

const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export default function OrderConfirmationClient({
  order,
}: {
  order: ShopifyOrder | null;
}) {
  const { clearCart } = useCart();

  /* Clear local cart once the confirmation page mounts */
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  if (!order) return null;

  return (
    <div className="rounded-3xl bg-white p-6 space-y-5">
      <h2 className="font-bold text-[#6B6D43]">Order summary</h2>

      {/* Line items */}
      <ul className="divide-y divide-slate-50">
        {order.lineItems.map((item, i) => (
          <li key={i} className="flex items-center justify-between py-2.5 text-sm">
            <div>
              <p className="font-semibold text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-400">Qty {item.quantity}</p>
            </div>
            <p className="font-semibold text-[#CF7D65]">
              {CAD.format(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="h-px bg-slate-100" />

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{CAD.format(order.subtotalPrice)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>
            {order.totalShippingPrice === 0 ? (
              <span className="text-[#ABA66F]">Free</span>
            ) : (
              CAD.format(order.totalShippingPrice)
            )}
          </span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tax</span>
          <span>{CAD.format(order.totalTax)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold">
          <span className="text-[#6B6D43]">Total</span>
          <span className="text-[#CF7D65]">{CAD.format(order.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
