/**
 * Shopify Storefront API client.
 *
 * Set the two env vars below in .env.local to enable real Shopify data:
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
 *   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token
 *
 * When the env vars are absent the module falls back to the mock catalogue
 * so the UI works in development without a live store.
 */

export type ColorOption = {
  label: string;
  hex: string;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
};

export type ProductDetail = {
  id: string;
  name: string;
  handle: string;
  category: string;
  material: string;
  badge?: "New" | "Best Seller";
  price: number;
  compareAtPrice?: number;
  currency: "CAD";
  rating: number;
  reviewCount: number;
  description: string[];
  specifications: {
    material: string;
    dimensions: string;
    weight: string;
    printTime: string;
    finish: string;
    layerResolution: string;
  };
  colors: ColorOption[];
  images: ProductImage[];
  reviews: Review[];
  shippingNote: string;
};

/* ─────────────────────────────────────────────
   Mock catalogue (mirrors the shop page data)
───────────────────────────────────────────── */
export const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: "arcadian",
    name: "Arcadian Miniature Set",
    handle: "arcadian-miniature-set",
    category: "Figurines",
    material: "PLA",
    badge: "Best Seller",
    price: 58,
    currency: "CAD",
    rating: 4.8,
    reviewCount: 142,
    description: [
      "The Arcadian Miniature Set brings three legendary heroes to life in stunning detail, engineered with hollow-wall construction that dramatically reduces weight without sacrificing structural integrity. Each figure stands 90 mm tall and fits seamlessly on standard 32 mm tabletop bases.",
      "Printed at 0.10 mm layer resolution on industry-grade FDM printers, the surface emerges smooth enough for brush-on priming straight out of the box. No sanding required — just prime, paint, and play.",
      "Each set ships in a padded kraft box with individual foam slots to prevent transit damage. Customize your order with any base colour option below; we also offer unpainted versions for painters who prefer a blank canvas.",
    ],
    specifications: {
      material: "PLA+",
      dimensions: "9 × 4 × 4 cm per figure",
      weight: "18 g per figure",
      printTime: "6 h per figure",
      finish: "Matte, pre-primed",
      layerResolution: "0.10 mm",
    },
    colors: [
      { label: "Stone Grey", hex: "#9E9E9E" },
      { label: "Bone White", hex: "#F5F0E8" },
      { label: "Midnight Black", hex: "#1C1C1C" },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85", alt: "Arcadian Set — front view" },
      { url: "https://images.unsplash.com/photo-1521372404688-0d18567615d5?w=1200&q=85", alt: "Arcadian Set — detail close-up" },
      { url: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=85", alt: "Arcadian Set — side profile" },
      { url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=85", alt: "Arcadian Set — painted example" },
      { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85", alt: "Arcadian Set — packaging" },
    ],
    reviews: [
      { id: "r1", author: "Marcus T.", rating: 5, date: "2026-05-28", title: "Best miniatures I've ever bought", body: "The detail on the armour is incredible. Primed and painted in an afternoon. My gaming group was blown away.", verified: true },
      { id: "r2", author: "Priya S.", rating: 5, date: "2026-05-12", title: "Perfect for tabletop RPG", body: "Hollow construction means they're light and they survived being knocked off the table twice. Quality is top tier.", verified: true },
      { id: "r3", author: "Daniel W.", rating: 4, date: "2026-04-30", title: "Great quality, slight delay", body: "Took an extra 3 days to ship but the figures themselves are fantastic. Would order again.", verified: false },
      { id: "r4", author: "Sophie L.", rating: 5, date: "2026-04-15", title: "Gift for my husband — he loved it", body: "Pre-primed surfaces are a huge time saver. He had all three painted the same night they arrived.", verified: true },
    ],
    shippingNote: "Estimated delivery: 5–8 business days across Canada. Free shipping on orders over CAD $75.",
  },
  {
    id: "aurora",
    name: "Aurora Hoop Earrings",
    handle: "aurora-hoop-earrings",
    category: "Jewelry",
    material: "Resin",
    badge: "New",
    price: 118,
    compareAtPrice: 145,
    currency: "CAD",
    rating: 4.9,
    reviewCount: 87,
    description: [
      "The Aurora Hoops are cast in water-clear UV resin over a 925 sterling silver core, blending additive manufacturing with traditional jewelry craft. Each hoop measures 45 mm in diameter — bold enough to make a statement, light enough to wear all day.",
      "A proprietary post-cure process under UV light hardens the resin to gem clarity while preserving the delicate internal faceting that catches light from every angle. The result is a piece that looks machined yet unmistakably handmade.",
      "Available in three colourways: Celestial (clear), Dusk (warm amber), and Tide (ocean teal). Each pair arrives in a signature CraftCore linen pouch with a polishing cloth.",
    ],
    specifications: {
      material: "UV Resin over 925 silver",
      dimensions: "Ø 45 mm × 4 mm",
      weight: "3 g per earring",
      printTime: "2 h per pair",
      finish: "High-gloss UV cure",
      layerResolution: "0.05 mm (MSLA)",
    },
    colors: [
      { label: "Celestial Clear", hex: "#E8F4F8" },
      { label: "Dusk Amber", hex: "#D4956A" },
      { label: "Tide Teal", hex: "#4AACB8" },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1200&q=85", alt: "Aurora Hoops — worn" },
      { url: "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=1200&q=85", alt: "Aurora Hoops — flat lay" },
      { url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&q=85", alt: "Aurora Hoops — light diffraction" },
      { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85", alt: "Aurora Hoops — all colourways" },
      { url: "https://images.unsplash.com/photo-1472220625704-91e1462799b2?w=1200&q=85", alt: "Aurora Hoops — pouch packaging" },
      { url: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=85", alt: "Aurora Hoops — detail close-up" },
    ],
    reviews: [
      { id: "r1", author: "Claire M.", rating: 5, date: "2026-06-10", title: "Absolutely stunning", body: "I've been looking for statement earrings that aren't heavy. These are perfect — light, beautiful, and I get compliments every single time.", verified: true },
      { id: "r2", author: "Ines R.", rating: 5, date: "2026-05-28", title: "Wedding accessory", body: "Wore these at my sister's wedding. The Celestial Clear colour matched everything and caught the light perfectly in photos.", verified: true },
      { id: "r3", author: "Aaliya K.", rating: 5, date: "2026-05-15", title: "Great gift", body: "Bought for my mum's birthday. She keeps saying strangers stop her to ask where she got them from.", verified: false },
    ],
    shippingNote: "Estimated delivery: 3–5 business days. Jewelry ships in padded boxes at no extra cost.",
  },
  {
    id: "luna",
    name: "Luna Ball Lamp",
    handle: "luna-ball-lamp",
    category: "Home Décor",
    material: "ABS",
    price: 184,
    currency: "CAD",
    rating: 4.6,
    reviewCount: 63,
    description: [
      "The Luna Ball Lamp is a study in disciplined geometry. Its spherical shade is printed in translucent white ABS, diffusing a warm E14 bulb into a soft, ambient glow that mimics the look of a full moon in your living room.",
      "The design integrates a hidden wall-mount bracket that makes the lamp appear to float. Installation takes under 10 minutes using the included anchor kit — no electrician required. The cable runs neatly through a recessed channel on the back of the mount.",
      "Diameter 22 cm. Compatible with all E14 LED bulbs up to 8 W. Ships with a 1.8 m fabric-braided cable in matching off-white.",
    ],
    specifications: {
      material: "ABS (translucent white)",
      dimensions: "Ø 22 cm",
      weight: "410 g",
      printTime: "14 h",
      finish: "Satin, natural translucent",
      layerResolution: "0.15 mm",
    },
    colors: [
      { label: "Pearl White", hex: "#F8F5EE" },
      { label: "Warm Cream", hex: "#F2DEC7" },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=1200&q=85", alt: "Luna Lamp — lit" },
      { url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=85", alt: "Luna Lamp — wall mount" },
      { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85", alt: "Luna Lamp — detail glow" },
      { url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=85", alt: "Luna Lamp — bracket system" },
      { url: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=1200&q=85", alt: "Luna Lamp — room context" },
    ],
    reviews: [
      { id: "r1", author: "Theo B.", rating: 5, date: "2026-05-20", title: "Transformed my bedroom", body: "Replaced a boring ceiling fixture with this. The floating effect is real — guests always ask about it.", verified: true },
      { id: "r2", author: "Mia C.", rating: 4, date: "2026-05-05", title: "Beautiful but installation took time", body: "The lamp itself is stunning. Just give yourself 30 mins for the mount rather than the stated 10.", verified: true },
      { id: "r3", author: "Jake F.", rating: 5, date: "2026-04-22", title: "Worth every penny", body: "Quality is way beyond what I expected at this price. The glow is incredibly calming.", verified: false },
    ],
    shippingNote: "Estimated delivery: 7–10 business days. Shipped in double-walled packaging to protect the shade.",
  },
];

/* ─────────────────────────────────────────────
   Product list type (used by shop page)
───────────────────────────────────────────── */
export type ProductListItem = {
  id: string;
  name: string;
  handle: string;
  variantId: string;
  category: string;
  material: string;
  badge?: "New" | "Best Seller";
  price: number;
  compareAtPrice?: number;
  currency: "CAD";
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
};

/* ─────────────────────────────────────────────
   Shopify Storefront GraphQL query
   (used when env vars are present)
───────────────────────────────────────────── */
const PRODUCT_QUERY = /* GraphQL */ `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
      }
      images(first: 8) {
        edges { node { url altText } }
      }
      variants(first: 10) {
        edges {
          node {
            id title
            selectedOptions { name value }
            priceV2 { amount currencyCode }
          }
        }
      }
      metafields(
        identifiers: [
          { namespace: "custom", key: "material" }
          { namespace: "custom", key: "dimensions" }
          { namespace: "custom", key: "weight" }
          { namespace: "custom", key: "print_time" }
          { namespace: "custom", key: "finish" }
          { namespace: "custom", key: "layer_resolution" }
          { namespace: "custom", key: "badge" }
          { namespace: "custom", key: "category" }
        ]
      ) { key value }
    }
  }
`;

async function shopifyFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) throw new Error("Shopify env vars not configured");

  const res = await fetch(`https://${domain}/api/2024-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json() as { data: T };
  return json.data;
}

/* ─────────────────────────────────────────────
   Public API — used by the page component
───────────────────────────────────────────── */
export async function getProduct(id: string): Promise<ProductDetail | null> {
  // Try Shopify first; fall back to mock data
  try {
    const data = await shopifyFetch<{ product: Record<string, unknown> }>(
      PRODUCT_QUERY,
      { handle: id }
    );

    if (!data.product) return null;

    // Map Shopify response → ProductDetail
    // Adjust this mapping to match your store's metafield setup
    const p = data.product as {
      title: string;
      handle: string;
      description: string;
      priceRange: { minVariantPrice: { amount: string } };
      compareAtPriceRange: { minVariantPrice: { amount: string } };
      images: { edges: { node: { url: string; altText: string } }[] };
      metafields: { key: string; value: string }[];
    };

    const meta = (key: string) =>
      p.metafields?.find((m) => m.key === key)?.value ?? "";

    return {
      id,
      name: p.title,
      handle: p.handle,
      category: meta("category") || "General",
      material: meta("material") || "PLA",
      badge: (meta("badge") as ProductDetail["badge"]) || undefined,
      price: parseFloat(p.priceRange.minVariantPrice.amount),
      compareAtPrice: p.compareAtPriceRange?.minVariantPrice?.amount
        ? parseFloat(p.compareAtPriceRange.minVariantPrice.amount)
        : undefined,
      currency: "CAD",
      rating: 0,
      reviewCount: 0,
      description: [p.description],
      specifications: {
        material: meta("material"),
        dimensions: meta("dimensions"),
        weight: meta("weight"),
        printTime: meta("print_time"),
        finish: meta("finish"),
        layerResolution: meta("layer_resolution"),
      },
      colors: [],
      images: p.images.edges.map(({ node }) => ({
        url: node.url,
        alt: node.altText ?? p.title,
      })),
      reviews: [],
      shippingNote: "Estimated delivery: 5–8 business days across Canada.",
    };
  } catch {
    // Fall back to mock data
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

/* ─────────────────────────────────────────────
   Products list query
───────────────────────────────────────────── */
const PRODUCTS_QUERY = /* GraphQL */ `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
          }
          variants(first: 1) {
            edges { node { id } }
          }
          metafields(
            identifiers: [
              { namespace: "custom", key: "badge" }
              { namespace: "custom", key: "category" }
              { namespace: "custom", key: "material" }
            ]
          ) { key value }
        }
      }
    }
  }
`;

export async function getProducts(limit = 50): Promise<ProductListItem[]> {
  try {
    const data = await shopifyFetch<{
      products: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            description: string;
            priceRange: { minVariantPrice: { amount: string } };
            compareAtPriceRange: { minVariantPrice: { amount: string } };
            images: { edges: { node: { url: string; altText: string } }[] };
            variants: { edges: { node: { id: string } }[] };
            metafields: { key: string; value: string }[];
          };
        }[];
      };
    }>(PRODUCTS_QUERY, { first: limit });

    return data.products.edges.map(({ node: p }) => {
      const meta = (key: string) =>
        p.metafields?.filter(Boolean).find((m) => m.key === key)?.value ?? "";

      return {
        id: p.handle,
        name: p.title,
        handle: p.handle,
        variantId: p.variants.edges[0]?.node.id ?? "",
        category: meta("category") || "General",
        material: meta("material") || "PLA",
        badge: (meta("badge") as ProductListItem["badge"]) || undefined,
        price: parseFloat(p.priceRange.minVariantPrice.amount),
        compareAtPrice: p.compareAtPriceRange?.minVariantPrice?.amount
          ? parseFloat(p.compareAtPriceRange.minVariantPrice.amount)
          : undefined,
        currency: "CAD",
        rating: 0,
        reviewCount: 0,
        description: p.description,
        image: p.images.edges[0]?.node.url ?? "",
      };
    });
  } catch {
    // Fall back to mock products list
    return MOCK_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      variantId: "",
      category: p.category,
      material: p.material,
      badge: p.badge,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      currency: "CAD",
      rating: p.rating,
      reviewCount: p.reviewCount,
      description: p.description[0] ?? "",
      image: p.images[0]?.url ?? "",
    }));
  }
}
