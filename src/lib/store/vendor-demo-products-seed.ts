import type { Product } from "@/lib/mock-data";

/**
 * 20 extra demo products for the Spice Hub vendor product listing, so
 * pagination (15/page) has real data to page through. These live only in the
 * vendor-side `custom` product list (see `vendor-products-store.tsx`) — the
 * customer catalog reads `mock-data.ts`'s static `products` array directly
 * and never sees these.
 */
const NAMES_UNITS: [string, string][] = [
  ["Everest Garam Masala", "100 g pouch"],
  ["MDH Deggi Mirch", "100 g pouch"],
  ["Tata Sampann Toor Dal", "1 kg pack"],
  ["Fortune Chana Besan", "1 kg pack"],
  ["Catch Coriander Powder", "200 g pouch"],
  ["24 Mantra Organic Turmeric", "200 g pouch"],
  ["Saffola Gold Cooking Oil", "1 L bottle"],
  ["MTR Rava Idli Mix", "500 g pack"],
  ["Bambino Vermicelli", "400 g pack"],
  ["Priya Pickle — Mango", "300 g jar"],
  ["Haldiram's Bhujia Sev", "200 g pack"],
  ["Britannia Marie Gold Biscuits", "250 g pack"],
  ["Parle-G Biscuits Family Pack", "1 kg pack"],
  ["Tata Tea Premium", "1 kg pack"],
  ["Nescafe Classic Coffee", "200 g jar"],
  ["Amul Ghee", "1 L tin"],
  ["Aashirvaad Select Atta", "10 kg bag"],
  ["Patanjali Honey", "500 g jar"],
  ["Everest Kitchen King Masala", "100 g pouch"],
  ["Dabur Chyawanprash", "500 g jar"],
];

const CATEGORY_CYCLE = ["grocery-staples", "biscuits-snacks", "frozen"];

const IMAGE_POOL = [
  "/product-images/ing-olive-oil.png",
  "/product-images/ing-honey.png",
  "/product-images/ing-basmati-rice.png",
  "/product-images/ing-red-lentils.png",
  "/product-images/ing-oats.png",
  "/product-images/ing-butter.png",
];

function buildProduct(index: number): Product {
  const [name, unit] = NAMES_UNITS[index];
  const categoryId = CATEGORY_CYCLE[index % CATEGORY_CYCLE.length];
  const price = 80 + index * 15;
  const primaryImage = IMAGE_POOL[index % IMAGE_POOL.length];
  // Give roughly half the demo products a small multi-image gallery so the
  // gallery/thumbnail UI has real data to show without seeding every row.
  const images =
    index % 2 === 0
      ? [
          primaryImage,
          IMAGE_POOL[(index + 1) % IMAGE_POOL.length],
          IMAGE_POOL[(index + 2) % IMAGE_POOL.length],
        ]
      : [primaryImage];

  return {
    id: `vp-demo-${String(index + 1).padStart(2, "0")}`,
    name,
    categoryId,
    brandId: "spice-hub-own",
    price,
    unit,
    description: `${name} — a Spice Hub pantry staple.`,
    image: images[0],
    images,
    rating: 4 + (index % 10) / 10,
    reviewCount: 10 + index * 3,
    inStock: true,
    seller_id: "spice-hub",
    store_name: "Spice Hub",
    sku: `SH-DEMO-${String(index + 1).padStart(3, "0")}`,
    stockQty: 20 + (index % 5) * 10,
    enabled: true,
  };
}

export const SPICE_HUB_DEMO_PRODUCTS: Product[] = Array.from({ length: 20 }, (_, i) =>
  buildProduct(i),
);
