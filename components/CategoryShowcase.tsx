"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Category = {
  name: string;
  description: string;
  image: string;
};

const categories: Category[] = [
  {
    name: "Miniature Figurines",
    description:
      "Hand-finished miniatures for tabletop play, collectible sets, and heirloom display pieces.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
  },
  {
    name: "Jewelry & Accessories",
    description:
      "Custom rings, pendants, and statement accessories that blend modern curves with artisan details.",
    image: "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=1200&q=80",
  },
  {
    name: "Industrial Prototypes",
    description:
      "High-detail mechanical and enclosure prototypes designed to validate fit, form, and function.",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80",
  },
  {
    name: "Home Decor & Sculptures",
    description:
      "Statement lighting, planters, and art pieces printed in luxe finishes to warm any living space.",
    image: "/HomeDecor.png",
  },
];

const CATEGORY_COLORS = {
  background: "rgba(242,222,199,0.9)",
  border: "rgba(207,125,101,0.35)",
  accent: "#CF7D65",
  secondary: "#6B6D43",
} as const;

function CategoryCard({ category }: { category: Category }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ translateY: -4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col rounded-3xl border bg-white/90 shadow-[0_25px_65px_-45px_rgba(0,0,0,0.6)] overflow-hidden"
      style={{ borderColor: CATEGORY_COLORS.border }}
    >
      <div className="relative w-full h-48 bg-slate-100">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col gap-4 p-6">
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-slate-400">Category</p>
          <h3 className="text-2xl font-bold" style={{ color: CATEGORY_COLORS.secondary }}>
            {category.name}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{category.description}</p>
        <div className="mt-auto">
          <Link
            href={`/shop?category=${encodeURIComponent(category.name)}`}
            className="inline-flex items-center justify-between w-full rounded-2xl px-5 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300"
            style={{
              background:
                "linear-gradient(120deg, rgba(207,125,101,0.95), rgba(207,125,101,0.65) 65%)",
              boxShadow: "0 20px 40px -28px rgba(207,125,101,0.8)",
            }}
          >
            Explore Category
            <span
              aria-hidden="true"
              className="ml-2 inline-block w-3 h-3 rounded-full bg-white/80"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function CategoryShowcase() {
  return (
    <section
      id="category-showcase"
      className="w-full py-16 bg-gradient-to-b from-white via-[#F2DEC7] to-white text-[#6B6D43]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Featured categories</p>
          <h2 className="text-3xl font-bold sm:text-4xl">Shop by curated collections</h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
            Each collection blends tactile finishes with precise layering so you can launch
            prototypes, gifts, or gallery pieces without the guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
