import { getProducts } from "@/lib/shopify";
import CartClient from "./CartClient";

export default async function CartPage() {
  const products = await getProducts();
  return <CartClient recommendedProducts={products} />;
}
