"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
//Hero section component is great
/*
  Brand palette (from company color guide):
  #99B4AA  — dusty teal
  #6B6D43  — olive
  #ABA66F  — sage
  #CF7D65  — terracotta (primary accent)
  #E1B8A2  — blush
  #F2DEC7  — cream (lightest)
*/

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleScroll = () => {
      const bg = hero.querySelector<HTMLElement>("[data-parallax]");
      if (bg) {
        bg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
      aria-label="Hero section"
    >
      {/* ── Background image ── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          data-parallax
          className="absolute inset-0 will-change-transform transition-transform duration-75"
          style={{ top: "-10%", height: "120%" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&q=80"
            alt="Precision 3D printed geometric object"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Solid cream overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(242,222,199,0.85)" }}
        />
      </div>

      {/* ── Decorative corner accents in terracotta ── */}
      {(["top-6 left-6 border-t-2 border-l-2", "top-6 right-6 border-t-2 border-r-2",
        "bottom-6 left-6 border-b-2 border-l-2", "bottom-6 right-6 border-b-2 border-r-2"] as const
      ).map((cls) => (
        <span
          key={cls}
          aria-hidden="true"
          className={`absolute w-10 h-10 ${cls}`}
          style={{ borderColor: "rgba(207,125,101,0.55)" }}
        />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-8 max-w-5xl mx-auto">

        {/* Eyebrow pill */}
        <div
          className={`
            mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            text-xs sm:text-sm tracking-[0.2em] uppercase font-medium
            transition-all duration-700 ease-out
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
          style={{
            border: "1px solid rgba(207,125,101,0.40)",
            color: "#6B6D43",
            backgroundColor: "rgba(242,222,199,0.55)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "#CF7D65" }}
          />
          3D Printing Studio
        </div>

        {/* Main heading */}
        <h1
          className={`
    font-bold tracking-tight my-0
    text-5xl sm:text-6xl md:text-7xl lg:text-8xl
    leading-none
    transition-all duration-700 delay-150 ease-out
    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
  `}
          style={{ color: "#cf7d65" }}
        >
          <span className="block">CraftCore</span>

          <div className="-mt-1 sm:-mt-1">
            <span className="block text-xs sm:text-sm font-sans font-normal tracking-normal"
              style={{ color: "#6B6D43" }} >
              Precision Crafted. Layer By Layer.
            </span>
          </div>
        </h1>

        {/* Divider */}
        <div
          className={`
            mt-7 mb-7 flex items-center gap-3
            transition-all duration-700 delay-300 ease-out
            ${isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}
          `}
          aria-hidden="true"
        >
          <span className="h-px w-12 sm:w-20" style={{ backgroundColor: "rgba(207,125,101,0.45)" }} />
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#CF7D65" }} />
          <span className="h-px w-12 sm:w-20" style={{ backgroundColor: "rgba(207,125,101,0.45)" }} />
        </div>

        {/* CTA buttons */}
        <div
          className={`
            mt-10 flex flex-col sm:flex-row items-center gap-4
            transition-all duration-700 delay-500 ease-out
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          {/* Primary — terracotta */}
          <Link
            href="/shop"
            className="
              group inline-flex items-center gap-2
              px-8 py-3.5 rounded-sm
              font-semibold text-base tracking-wide text-white
              transition-all duration-300
              hover:scale-[1.03] active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            "
            style={{
              backgroundColor: "#CF7D65",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b86b54")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#CF7D65")}
          >
            Shop Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          {/* Secondary — olive outline */}
          <Link
            href="/gallery"
            className="
              inline-flex items-center gap-2
              px-8 py-3.5 rounded-sm
              font-medium text-base tracking-wide
              transition-all duration-300
              hover:scale-[1.03] active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            "
            style={{
              border: "1.5px solid rgba(107,109,67,0.55)",
              color: "#6B6D43",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6B6D43";
              e.currentTarget.style.backgroundColor = "rgba(107,109,67,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(107,109,67,0.55)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            View Gallery
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          className={`
            mt-14 flex flex-wrap justify-center items-center gap-6 sm:gap-10
            transition-all duration-700 delay-[600ms] ease-out
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
        >
          {[
            { value: "500+", label: "Orders Shipped" },
            { value: "0.1mm", label: "Layer Precision" },
            { value: "30+", label: "Materials" },
            { value: "5★", label: "Avg. Rating" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span
                className="font-semibold text-base sm:text-lg"
                style={{ color: "#CF7D65" }}
              >
                {value}
              </span>
              <span
                className="uppercase tracking-widest text-[10px]"
                style={{ color: "#ABA66F" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <a
        href="#features"
        aria-label="Scroll to features"
        className={`
          absolute bottom-8 left-1/2 -translate-x-1/2 z-10
          flex flex-col items-center gap-1.5
          transition-all duration-700 delay-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
        style={{ color: "#ABA66F" }}
      >
        <span className="text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <span
          className="w-px h-8 animate-bounce"
          style={{
            background: "linear-gradient(to bottom, rgba(171,166,111,0.6), transparent)",
          }}
        />
      </a>
    </section>
  );
}
