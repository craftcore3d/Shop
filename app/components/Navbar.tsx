"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E1B8A2]/40 bg-[#F2DEC7]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-[#6B6D43]">CraftCore</span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-[#ABA66F] sm:block">
            Precision Crafted
          </span>
        </Link>

        {/* Nav links + cart grouped on the right */}
        <div className="hidden items-center gap-6 sm:flex">
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-semibold transition ${
                  pathname === href
                    ? "text-[#CF7D65]"
                    : "text-[#6B6D43] hover:text-[#CF7D65]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Cart icon */}
          <Link
          href="/cart"
          aria-label={`Cart (${itemCount} items)`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#E1B8A2]/40"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-[#6B6D43]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#CF7D65] text-[9px] font-bold text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
