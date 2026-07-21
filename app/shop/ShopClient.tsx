"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { ProductListItem } from "@/lib/shopify";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Badge = "New" | "Best Seller";
type Product = ProductListItem & { details: string[]; createdAt: number; popularity: number };

type CartToast = { id: string; name: string };

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "new", label: "New Arrivals" },
  { value: "best", label: "Best Sellers" },
  { value: "priceLow", label: "Price: Low → High" },
  { value: "priceHigh", label: "Price: High → Low" },
  { value: "rating", label: "Customer Rating" },
];
const ITEMS_PER_PAGE = 12;
const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

/* ─────────────────────────────────────────────
   StarRating
───────────────────────────────────────────── */
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <svg
              key={i}
              viewBox="0 0 20 20"
              className={`h-3.5 w-3.5 ${filled ? "text-[#CF7D65]" : half ? "text-[#CF7D65]" : "text-slate-200"}`}
              fill="currentColor"
            >
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`h${i}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#h${i})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </>
              ) : (
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              )}
            </svg>
          );
        })}
      </div>
      <span className="text-xs text-slate-400">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Badge chip
───────────────────────────────────────────── */
function BadgeChip({ badge }: { badge: Badge }) {
  const isNew = badge === "New";
  return (
    <span
      className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
        isNew
          ? "bg-[#99B4AA] text-white"
          : "bg-[#CF7D65] text-white"
      }`}
    >
      {badge}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Product card skeleton
───────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="h-52 bg-slate-100" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-1/3 rounded-full bg-slate-100" />
        <div className="h-4 w-2/3 rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 flex-1 rounded-xl bg-slate-100" />
          <div className="h-8 flex-1 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Quick View modal
───────────────────────────────────────────── */
function QuickViewModal({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:flex-row"
      >
        {/* Image */}
        <div className="relative h-64 shrink-0 sm:h-auto sm:w-56">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 224px"
          />
          {product.badge && <BadgeChip badge={product.badge} />}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">{product.category} · {product.material}</p>
            <h2 className="mt-1 text-2xl font-bold text-[#6B6D43]">{product.name}</h2>
          </div>
          <StarRating rating={product.rating} count={product.reviewCount} />
          <p className="text-sm leading-relaxed text-slate-500">{product.description}</p>
          <ul className="space-y-1">
            {product.details.map((d) => (
              <li key={d} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-1 w-1 rounded-full bg-[#CF7D65]" />
                {d}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between">
            <p className="text-2xl font-bold text-[#CF7D65]">{CAD.format(product.price)}</p>
            <button
              onClick={() => { onAddToCart(product); onClose(); }}
              className="rounded-2xl bg-[#6B6D43] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f5236] active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-slate-600 transition hover:bg-black/20"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Cart toast
───────────────────────────────────────────── */
function CartToast({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#6B6D43] px-5 py-3.5 text-sm text-white shadow-2xl">
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ABA66F]" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span><span className="font-semibold">{name}</span> added to cart</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main client component
───────────────────────────────────────────── */
export default function ShopClient({ products: rawProducts }: { products: ProductListItem[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";

  const PRODUCTS: Product[] = rawProducts.map((p, i) => ({
    ...p,
    details: [],
    createdAt: Date.now() - i * 86400000,
    popularity: 100 - i,
  }));

  const [sortOption, setSortOption] = useState("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cartToasts, setCartToasts] = useState<CartToast[]>([]);
  const { addItem } = useCart();

  /* Reset page when sort changes */
  useEffect(() => { setCurrentPage(1); }, [sortOption]);

  /* Simulate load */
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 380);
    return () => clearTimeout(t);
  }, [sortOption, currentPage]);

  const addToCart = useCallback((product: Product) => {
    const toastId = `${product.id}-${Date.now()}`;
    setCartToasts((prev) => [...prev, { id: toastId, name: product.name }]);
    addItem({
      productId: product.variantId || product.id,
      handle: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedColor: "",
      category: product.category,
      quantity: 1,
    });
  }, [addItem]);

  const dismissToast = useCallback((id: string) => {
    setCartToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* Filter by category from URL param only */
  const filteredProducts = useMemo(() => {
    if (!initialCategory) return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === initialCategory);
  }, [initialCategory]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortOption) {
      case "best": return list.sort((a, b) => b.popularity - a.popularity);
      case "priceLow": return list.sort((a, b) => a.price - b.price);
      case "priceHigh": return list.sort((a, b) => b.price - a.price);
      case "rating": return list.sort((a, b) => b.rating - a.rating);
      default: return list.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [filteredProducts, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      {/* Quick View modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {cartToasts.map((t) => (
          <CartToast key={t.id} name={t.name} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>

      <main className="min-h-screen bg-[#F2DEC7] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page header */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-[#ABA66F]">CraftCore</p>
            <h1 className="mt-1 text-3xl font-bold text-[#6B6D43] sm:text-4xl">Shop All Products</h1>
          </div>

          <div>
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {/* Sort */}
              <div className="ml-auto flex items-center gap-2">
                  <label htmlFor="sort" className="hidden text-xs font-semibold text-slate-500 sm:block">
                    Sort
                  </label>
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#6B6D43] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/40"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result count */}
              <p className="mb-4 text-xs text-slate-400">
                {sortedProducts.length} {sortedProducts.length === 1 ? "product" : "products"} in catalogue
              </p>

              {/* Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#E1B8A2] bg-white/60 py-20 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2DEC7]">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#CF7D65]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#6B6D43]">No products found</p>
                    <p className="mt-1 text-sm text-slate-400">Check back soon for new arrivals</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {paginatedProducts.map((product) => (
                    <article
                      key={product.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                        {product.badge && <BadgeChip badge={product.badge} />}
                        {/* Quick view on hover */}
                        <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-4 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#6B6D43] shadow-lg transition hover:bg-[#6B6D43] hover:text-white"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col gap-2.5 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400">{product.category}</p>
                            <Link href={`/shop/${product.id}`} className="mt-0.5 block truncate text-sm font-semibold text-slate-800 hover:text-[#6B6D43]">{product.name}</Link>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-[#CF7D65]">{CAD.format(product.price)}</p>
                        </div>

                        <StarRating rating={product.rating} count={product.reviewCount} />

                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{product.description}</p>

                        {/* Material chip */}
                        <span className="w-fit rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          {product.material}
                        </span>

                        {/* CTAs */}
                        <div className="mt-auto flex gap-2 pt-1">
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#6B6D43] hover:text-[#6B6D43]"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 rounded-xl bg-[#6B6D43] py-2 text-xs font-semibold text-white transition hover:bg-[#4f5236] active:scale-95"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#6B6D43] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Prev
                  </button>

                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                        n === currentPage
                          ? "bg-[#6B6D43] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-[#6B6D43]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#6B6D43] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Page info */}
              {!isLoading && sortedProducts.length > 0 && (
                <p className="mt-4 text-center text-xs text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)} of{" "}
                  {sortedProducts.length} products
                </p>
              )}
          </div>
        </div>
      </main>
    </>
  );
}
