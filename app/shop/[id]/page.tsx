import { notFound } from "next/navigation";
import { getProduct, MOCK_PRODUCTS } from "@/lib/shopify";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

/* Pre-render known product pages at build time */
export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return {
    title: `${product.name} — CraftCore`,
    description: product.description[0]?.slice(0, 155),
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
