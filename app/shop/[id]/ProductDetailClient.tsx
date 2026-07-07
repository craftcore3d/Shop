"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductDetail, Review } from "@/lib/shopify";
import { useCart } from "@/lib/cart";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* ─────────────────────────────────────────────
   Star display (filled / half / empty)
───────────────────────────────────────────── */
function Stars({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        const cls = `h-${size} w-${size} ${filled || half ? "text-[#CF7D65]" : "text-slate-200"}`;
        return (
          <svg key={i} viewBox="0 0 20 20" className={cls} fill="currentColor">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`h${i}`}>
                    <stop offset="50%" stopColor="#CF7D65" />
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
  );
}

/* ─────────────────────────────────────────────
   Zoomable main image
───────────────────────────────────────────── */
function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    setOrigin(`${x}% ${y}%`);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#F8F5EF]"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => { setZoom(false); setOrigin("50% 50%"); }}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-200 ease-out"
        style={{
          transform: zoom ? "scale(2)" : "scale(1)",
          transformOrigin: origin,
        }}
      />
      {!zoom && (
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
            <path d="M5 8a3 3 0 116 0A3 3 0 015 8zM1.293 15.293a1 1 0 011.414 0l.099.099A7.001 7.001 0 0013.5 15.5a1 1 0 010 2A9.001 9.001 0 011.293 16.707a1 1 0 010-1.414z" />
            <path fillRule="evenodd" d="M8 3a5 5 0 100 10A5 5 0 008 3zm-7 5a7 7 0 1114 0A7 7 0 011 8z" clipRule="evenodd" />
          </svg>
          Hover to zoom
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mobile swipeable carousel
───────────────────────────────────────────── */
function MobileCarousel({
  images,
  activeIndex,
  onChange,
}: {
  images: ProductDetail["images"];
  activeIndex: number;
  onChange: (i: number) => void;
}) {
  const startX = useRef<number | null>(null);

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F5EF]"
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) onChange(Math.min(activeIndex + 1, images.length - 1));
        else onChange(Math.max(activeIndex - 1, 0));
        startX.current = null;
      }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: i === activeIndex ? 1 : 0, pointerEvents: i === activeIndex ? "auto" : "none" }}
        >
          <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="100vw" />
        </div>
      ))}
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-5 bg-[#CF7D65]" : "w-1.5 bg-white/60"}`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
      {/* Arrow buttons */}
      {activeIndex > 0 && (
        <button
          onClick={() => onChange(activeIndex - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6B6D43] shadow"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      {activeIndex < images.length - 1 && (
        <button
          onClick={() => onChange(activeIndex + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6B6D43] shadow"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Single review card
───────────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  const dateLabel = new Date(review.date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2DEC7] text-sm font-bold text-[#6B6D43]">
          {review.author.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#6B6D43]">{review.author}</p>
            {review.verified && (
              <span className="flex items-center gap-1 rounded-full bg-[#99B4AA]/20 px-2 py-0.5 text-[10px] font-semibold text-[#6B6D43]">
                <svg viewBox="0 0 20 20" className="h-2.5 w-2.5" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
            <p className="text-xs text-slate-400">{dateLabel}</p>
          </div>
          <Stars rating={review.rating} size={3} />
        </div>
        <div className="shrink-0 text-[#CF7D65]">
          <Stars rating={review.rating} size={3} />
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">{review.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{review.body}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Cart toast
───────────────────────────────────────────── */
function CartToast({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#6B6D43] px-5 py-3.5 text-sm text-white shadow-2xl">
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ABA66F]" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span><span className="font-semibold">{name}</span> added to cart</span>
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Specification row
───────────────────────────────────────────── */
function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-50 py-2.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-[#6B6D43]">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.label ?? "");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartToast, setCartToast] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { addItem } = useCart();

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const visibleReviews = showAllReviews ? product.reviews : product.reviews.slice(0, 3);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      handle: product.handle,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url ?? "",
      selectedColor,
      category: product.category,
      quantity,
    });
    setCartToast(true);
  };

  return (
    <>
      {cartToast && (
        <CartToast name={product.name} onDismiss={() => setCartToast(false)} />
      )}

      <main className="min-h-screen bg-[#F2DEC7]">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#6B6D43]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#6B6D43]">Shop</Link>
            <span>/</span>
            <span className="text-[#6B6D43] font-medium">{product.name}</span>
          </nav>
        </div>

        {/* Product hero */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">

            {/* ── Left: Images ── */}
            <div className="space-y-4">
              {/* Main image — desktop zoom, mobile carousel */}
              <div className="hidden md:block">
                <ZoomImage
                  src={product.images[activeImage]?.url ?? ""}
                  alt={product.images[activeImage]?.alt ?? product.name}
                />
              </div>
              <div className="md:hidden">
                <MobileCarousel
                  images={product.images}
                  activeIndex={activeImage}
                  onChange={setActiveImage}
                />
              </div>

              {/* Thumbnail strip */}
              <div className="hidden grid-cols-5 gap-2.5 md:grid">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                      i === activeImage
                        ? "border-[#CF7D65]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={img.alt}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Right: Info ── */}
            <div className="flex flex-col gap-6">
              {/* Badge + category */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F2DEC7] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#ABA66F]">
                  {product.category}
                </span>
                {product.badge && (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white ${product.badge === "New" ? "bg-[#99B4AA]" : "bg-[#CF7D65]"}`}>
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold leading-tight text-[#6B6D43] sm:text-4xl">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-3">
                <Stars rating={product.rating} size={4} />
                <span className="text-sm font-semibold text-[#CF7D65]">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-slate-400">({product.reviewCount} reviews)</span>
                <a href="#reviews" className="text-sm font-semibold text-[#6B6D43] underline-offset-2 hover:underline">
                  Read reviews
                </a>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-[#CF7D65]">{CAD.format(product.price)}</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-slate-400 line-through">{CAD.format(product.compareAtPrice)}</span>
                    <span className="rounded-full bg-[#CF7D65]/15 px-2.5 py-0.5 text-xs font-bold text-[#CF7D65]">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-3">
                {product.description.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-600">{para}</p>
                ))}
              </div>

              <div className="h-px bg-slate-200" />

              {/* Color selector */}
              {product.colors.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#6B6D43]">Colour</p>
                    <p className="text-sm text-slate-500">{selectedColor}</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setSelectedColor(c.label)}
                        title={c.label}
                        className={`relative h-8 w-8 rounded-full border-2 transition ${
                          selectedColor === c.label
                            ? "border-[#CF7D65] ring-2 ring-[#CF7D65]/30 ring-offset-2"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        aria-label={c.label}
                        aria-pressed={selectedColor === c.label}
                      >
                        {selectedColor === c.label && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 drop-shadow" fill="white">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-[#6B6D43]">Quantity</p>
                <div className="flex h-11 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex flex-1 items-center justify-center text-lg text-slate-500 transition hover:bg-slate-50 active:bg-slate-100"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="flex w-10 items-center justify-center text-sm font-semibold text-[#6B6D43]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex flex-1 items-center justify-center text-lg text-slate-500 transition hover:bg-slate-50 active:bg-slate-100"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#6B6D43] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#4f5236] active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart · {CAD.format(product.price * quantity)}
                </button>
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-semibold transition active:scale-[0.98] ${
                    wishlisted
                      ? "border-[#CF7D65] bg-[#CF7D65]/10 text-[#CF7D65]"
                      : "border-slate-200 text-slate-600 hover:border-[#CF7D65] hover:text-[#CF7D65]"
                  }`}
                  aria-pressed={wishlisted}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill={wishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>

              {/* Shipping + returns */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-[#ABA66F]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-[#6B6D43]">Shipping</p>
                    <p className="text-xs text-slate-500">{product.shippingNote}</p>
                  </div>
                </div>
                <div className="h-px bg-slate-50" />
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-[#ABA66F]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-[#6B6D43]">Returns</p>
                    <p className="text-xs text-slate-500">
                      30-day hassle-free returns on all standard items.{" "}
                      <Link href="/returns" className="font-semibold text-[#6B6D43] underline-offset-2 hover:underline">
                        View return policy →
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="h-px bg-slate-50" />
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-[#ABA66F]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-[#6B6D43]">Quality guarantee</p>
                    <p className="text-xs text-slate-500">Every order is quality-checked before dispatch.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-6 sm:p-8">
            <h2 className="mb-5 text-xl font-bold text-[#6B6D43]">Specifications</h2>
            <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
              <SpecRow label="Material" value={product.specifications.material} />
              <SpecRow label="Dimensions" value={product.specifications.dimensions} />
              <SpecRow label="Weight" value={product.specifications.weight} />
              <SpecRow label="Print time" value={product.specifications.printTime} />
              <SpecRow label="Finish" value={product.specifications.finish} />
              <SpecRow label="Layer resolution" value={product.specifications.layerResolution} />
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section
          id="reviews"
          className="mx-auto max-w-7xl scroll-mt-8 px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-2xl bg-white p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#6B6D43]">Customer Reviews</h2>
                <div className="mt-1.5 flex items-center gap-3">
                  <Stars rating={product.rating} size={5} />
                  <span className="text-2xl font-bold text-[#CF7D65]">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-slate-400">based on {product.reviewCount} reviews</span>
                </div>
              </div>
              {/* Rating breakdown bar (decorative, proportional to rating) */}
              <div className="hidden space-y-1.5 sm:block">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === Math.round(product.rating) ? 70 : star === Math.floor(product.rating) ? 55 : Math.max(5, (star / 5) * 30);
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-3 text-right">{star}</span>
                      <svg viewBox="0 0 20 20" className="h-3 w-3 text-[#CF7D65]" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#CF7D65]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review list */}
            {product.reviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No reviews yet. Be the first!</p>
            ) : (
              <>
                <div className="space-y-4">
                  {visibleReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
                {product.reviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews((s) => !s)}
                    className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-[#6B6D43] transition hover:border-[#CF7D65] hover:text-[#CF7D65]"
                  >
                    {showAllReviews
                      ? "Show fewer reviews"
                      : `Show all ${product.reviews.length} reviews`}
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
