// Mock catalog. seller_id / store_name are the store relationship — every
// product belongs to exactly one store (see `stores` below), matched by
// seller_id === Store.id.

export type Subcategory = { id: string; name: string };

export type Category = {
  id: string;
  name: string;
  tagline: string;
  subcategories: Subcategory[];
};

export type ProductBadge = "organic" | "cold_sale" | "bestseller";

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  compareAtPrice?: number;
  unit: string;
  description: string;
  image: string;
  tag?: string;
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  color?: "black" | "blue" | "brown" | "gray" | "green" | "red";
  inStock: boolean;
  /** FK into `stores` — the store selling this product. */
  seller_id: string;
  /** Denormalized copy of the owning store's name, kept in sync with it. */
  store_name: string;
};

export type StoreCategory = { id: string; name: string };

export const storeCategories: StoreCategory[] = [
  { id: "grocery", name: "Grocery" },
  { id: "fruits-vegetables", name: "Fruits & Vegetables" },
  { id: "dairy", name: "Dairy" },
  { id: "bakery", name: "Bakery" },
  { id: "food-beverages", name: "Food & Beverages" },
  { id: "pharmacy", name: "Pharmacy" },
  { id: "beauty-personal-care", name: "Beauty & Personal Care" },
  { id: "baby-care", name: "Baby Care" },
  { id: "pet-supplies", name: "Pet Supplies" },
  { id: "electronics", name: "Electronics" },
  { id: "fashion", name: "Fashion" },
  { id: "home-kitchen", name: "Home & Kitchen" },
  { id: "stationery", name: "Stationery" },
  { id: "organic-products", name: "Organic Products" },
];

export type Store = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  categoryId: string;
  description: string;
  address: string;
  rating: number;
  deliveryTime: string;
  deliveryCharge: string;
  isOpen: boolean;
  isFeatured?: boolean;
  /** Theme color for the generated cover gradient + logo initials badge. */
  accent: string;
  /** Real assets, if ever added — falls back to the generated accent look. */
  logo?: string;
  coverImage?: string;
};

export const stores: Store[] = [
  {
    id: "freshmart-grocery",
    slug: "freshmart-grocery",
    name: "FreshMart Grocery",
    tagline: "Fresh groceries delivered in minutes",
    categoryId: "grocery",
    description:
      "Everyday groceries and pantry staples, delivered fast from the neighborhood store.",
    address: "Sector 18, Noida",
    rating: 4.6,
    deliveryTime: "20 min",
    deliveryCharge: "Free",
    isOpen: true,
    isFeatured: true,
    accent: "#4d8b3f",
    logo: "/store-logos/freshmart-grocery.svg",
  },
  {
    id: "green-basket",
    slug: "green-basket",
    name: "Green Basket",
    tagline: "Farm-fresh fruits & vegetables",
    categoryId: "fruits-vegetables",
    description: "Farm-direct fruits and vegetables, picked at peak and delivered the same day.",
    address: "Sector 62, Noida",
    rating: 4.7,
    deliveryTime: "18 min",
    deliveryCharge: "Free",
    isOpen: true,
    isFeatured: true,
    accent: "#4d8b3f",
    logo: "/store-logos/green-basket.svg",
  },
  {
    id: "daily-dairy",
    slug: "daily-dairy",
    name: "Daily Dairy",
    tagline: "Fresh milk, paneer & dairy essentials",
    categoryId: "dairy",
    description: "Cold-chain fresh milk, paneer, and dairy essentials from local farms.",
    address: "Sector 50, Noida",
    rating: 4.8,
    deliveryTime: "15 min",
    deliveryCharge: "Free",
    isOpen: true,
    isFeatured: true,
    accent: "#3b6fa0",
    logo: "/store-logos/daily-dairy.svg",
  },
  {
    id: "bake-bliss",
    slug: "bake-bliss",
    name: "Bake Bliss",
    tagline: "Freshly baked breads, cakes & pastries",
    categoryId: "bakery",
    description: "Naturally leavened breads, cakes, and pastries baked fresh every morning.",
    address: "Sector 37, Noida",
    rating: 4.8,
    deliveryTime: "25 min",
    deliveryCharge: "$1.49",
    isOpen: true,
    isFeatured: true,
    accent: "#8a5a3b",
    logo: "/store-logos/bake-bliss.svg",
  },
  {
    id: "spice-hub",
    slug: "spice-hub",
    name: "Spice Hub",
    tagline: "Premium spices and daily essentials",
    categoryId: "grocery",
    description: "Premium spices, oils, and daily grocery essentials for every kitchen.",
    address: "Sector 15, Noida",
    rating: 4.5,
    deliveryTime: "22 min",
    deliveryCharge: "$0.99",
    isOpen: true,
    accent: "#c94a3a",
    logo: "/store-logos/spice-hub.svg",
  },
  {
    id: "organic-harvest",
    slug: "organic-harvest",
    name: "Organic Harvest",
    tagline: "Healthy organic foods and grains",
    categoryId: "organic-products",
    description: "Certified organic grains, honey, and pantry staples grown without shortcuts.",
    address: "Sector 76, Noida",
    rating: 4.6,
    deliveryTime: "30 min",
    deliveryCharge: "Free",
    isOpen: false,
    accent: "#4d8b3f",
    logo: "/store-logos/organic-harvest.svg",
  },
  {
    id: "medicare-pharmacy",
    slug: "medicare-pharmacy",
    name: "MediCare Pharmacy",
    tagline: "Medicines and healthcare essentials",
    categoryId: "pharmacy",
    description: "Medicines and healthcare essentials, dispensed and delivered around the clock.",
    address: "Sector 27, Noida",
    rating: 4.7,
    deliveryTime: "12 min",
    deliveryCharge: "Free",
    isOpen: true,
    accent: "#c94a3a",
    logo: "/store-logos/medicare-pharmacy.svg",
  },
  {
    id: "smart-electronics",
    slug: "smart-electronics",
    name: "Smart Electronics",
    tagline: "Latest gadgets and home electronics",
    categoryId: "electronics",
    description: "The latest gadgets, accessories, and home electronics, delivered to your door.",
    address: "Sector 18, Noida",
    rating: 4.3,
    deliveryTime: "45 min",
    deliveryCharge: "$2.99",
    isOpen: true,
    accent: "#3b6fa0",
    logo: "/store-logos/smart-electronics.svg",
  },
  {
    id: "fashion-avenue",
    slug: "fashion-avenue",
    name: "Fashion Avenue",
    tagline: "Trending clothing and accessories",
    categoryId: "fashion",
    description: "Trending clothing and accessories for every season.",
    address: "Sector 18, Noida",
    rating: 4.4,
    deliveryTime: "60 min",
    deliveryCharge: "$2.49",
    isOpen: false,
    accent: "#8a8a8a",
    logo: "/store-logos/fashion-avenue.svg",
  },
  {
    id: "home-essentials",
    slug: "home-essentials",
    name: "Home Essentials",
    tagline: "Everything your home needs",
    categoryId: "home-kitchen",
    description: "Everything your home needs — from kitchen basics to everyday upkeep.",
    address: "Sector 63, Noida",
    rating: 4.5,
    deliveryTime: "35 min",
    deliveryCharge: "$1.99",
    isOpen: true,
    accent: "#8a5a3b",
    logo: "/store-logos/home-essentials.svg",
  },
  {
    id: "pet-paradise",
    slug: "pet-paradise",
    name: "Pet Paradise",
    tagline: "Food and accessories for pets",
    categoryId: "pet-supplies",
    description: "Food, treats, and accessories to keep every pet happy and healthy.",
    address: "Sector 12, Noida",
    rating: 4.6,
    deliveryTime: "40 min",
    deliveryCharge: "$1.99",
    isOpen: true,
    accent: "#c94a3a",
    logo: "/store-logos/pet-paradise.svg",
  },
  {
    id: "baby-care-world",
    slug: "baby-care-world",
    name: "Baby Care World",
    tagline: "Trusted products for babies and moms",
    categoryId: "baby-care",
    description: "Trusted, gentle products for babies and moms, delivered with care.",
    address: "Sector 50, Noida",
    rating: 4.7,
    deliveryTime: "30 min",
    deliveryCharge: "Free",
    isOpen: true,
    accent: "#3b6fa0",
    logo: "/store-logos/baby-care-world.svg",
  },
  {
    id: "beauty-bloom",
    slug: "beauty-bloom",
    name: "Beauty Bloom",
    tagline: "Cosmetics and skincare products",
    categoryId: "beauty-personal-care",
    description: "Cosmetics and skincare picks for every routine, curated and delivered fast.",
    address: "Sector 29, Noida",
    rating: 4.5,
    deliveryTime: "35 min",
    deliveryCharge: "$1.49",
    isOpen: true,
    accent: "#8a5a3b",
    logo: "/store-logos/beauty-bloom.svg",
  },
  {
    id: "stationery-point",
    slug: "stationery-point",
    name: "Stationery Point",
    tagline: "School and office supplies",
    categoryId: "stationery",
    description: "School and office supplies, stocked and ready whenever you need them.",
    address: "Sector 15, Noida",
    rating: 4.4,
    deliveryTime: "40 min",
    deliveryCharge: "$0.99",
    isOpen: false,
    accent: "#111111",
    logo: "/store-logos/stationery-point.svg",
  },
  {
    id: "quickbites-cafe",
    slug: "quickbites-cafe",
    name: "QuickBites Cafe",
    tagline: "Snacks, beverages and ready-to-eat meals",
    categoryId: "food-beverages",
    description: "Snacks, beverages, and ready-to-eat meals for whenever hunger strikes.",
    address: "Sector 18, Noida",
    rating: 4.6,
    deliveryTime: "20 min",
    deliveryCharge: "Free",
    isOpen: true,
    isFeatured: true,
    accent: "#c94a3a",
  },
];

export const categories: Category[] = [
  {
    id: "fruits-veg",
    name: "Fruits & Vegetables",
    tagline: "Picked at peak",
    subcategories: [
      { id: "cuts-sprouts", name: "Cuts & Sprouts" },
      { id: "exotic", name: "Exotic Fruits & Veggies" },
      { id: "fresh-fruits", name: "Fresh Fruits" },
      { id: "fresh-veg", name: "Fresh Vegetables" },
      { id: "herbs", name: "Herbs & Seasonings" },
      { id: "packaged-produce", name: "Packaged Produce" },
      { id: "party-trays", name: "Party Trays" },
    ],
  },
  {
    id: "meats-seafood",
    name: "Meats & Seafood",
    tagline: "Fresh cuts daily",
    subcategories: [
      { id: "beef", name: "Beef Products" },
      { id: "chicken-turkey", name: "Chicken and Turkey Products" },
      { id: "fish", name: "Fish Varieties" },
      { id: "lamb", name: "Lamb Products" },
      { id: "processed-red-meat", name: "Processed Red Meat Products" },
      { id: "seafood", name: "Seafood" },
    ],
  },
  {
    id: "breakfast-dairy",
    name: "Breakfast & Dairy",
    tagline: "Cold-chain fresh",
    subcategories: [
      { id: "breads-cereal", name: "Breads and Cereal Products" },
      { id: "breakfast-cereals-bars", name: "Breakfast Cereals and Bars" },
      { id: "butter-margarine", name: "Butter & Margarine" },
      { id: "cereals-granolas", name: "Cereals and Granolas" },
      { id: "cheese", name: "Cheese Varieties" },
      { id: "dairy-processing", name: "Dairy Processing Products" },
      { id: "eggs", name: "Eggs and Egg Products" },
      { id: "fresh-dairy", name: "Fresh Dairy Products" },
    ],
  },
  {
    id: "breads-bakery",
    name: "Breads & Bakery",
    tagline: "Baked fresh",
    subcategories: [
      { id: "pastries-rolls", name: "Bakery Pastries and Rolls" },
      { id: "fresh-bread", name: "Fresh Bread Varieties" },
      { id: "glazed-filled", name: "Glazed and Filled Products" },
      { id: "gluten-free", name: "Gluten-Free Alternatives" },
      { id: "organic-breads", name: "Organic and Natural Breads" },
      { id: "pizza-flatbreads", name: "Pizza and Flatbreads" },
      { id: "sandwich-wraps", name: "Sandwich Bread and Wraps" },
      { id: "sweets-pastry", name: "Sweets and Pastry Products" },
    ],
  },
  {
    id: "beverages",
    name: "Beverages",
    tagline: "Sip & refresh",
    subcategories: [
      { id: "drink-boxes", name: "Drink Boxes & Pouches" },
      { id: "coffee", name: "Coffee" },
      { id: "craft-beer", name: "Craft Beer" },
      { id: "milk-plant", name: "Milk & Plant-Based Milk" },
      { id: "soda-pop", name: "Soda & Pop" },
      { id: "sparkling-water", name: "Sparkling Water" },
    ],
  },
  { id: "frozen", name: "Frozen Foods", tagline: "Freezer picks", subcategories: [] },
  { id: "biscuits-snacks", name: "Biscuits & Snacks", tagline: "Clean labels", subcategories: [] },
  {
    id: "grocery-staples",
    name: "Grocery & Staples",
    tagline: "Everyday essentials",
    subcategories: [],
  },
  { id: "household", name: "Household Needs", tagline: "Home & clean", subcategories: [] },
  { id: "healthcare", name: "Healthcare", tagline: "Wellness picks", subcategories: [] },
  { id: "baby", name: "Baby & Pregnancy", tagline: "Little ones", subcategories: [] },
];

export const brands = [
  { id: "harvest", name: "Harvest Co", count: 4 },
  { id: "daily", name: "Daily Fresh", count: 3 },
  { id: "orchard", name: "Orchard Lane", count: 3 },
  { id: "millhouse", name: "Millhouse", count: 3 },
  { id: "kitchen", name: "Slow Kitchen", count: 3 },
];

export const productColors = [
  { id: "green", name: "Green", swatch: "#4d8b3f", count: 4 },
  { id: "red", name: "Red", swatch: "#c94a3a", count: 3 },
  { id: "brown", name: "Brown", swatch: "#8a5a3b", count: 3 },
  { id: "blue", name: "Blue", swatch: "#3b6fa0", count: 2 },
  { id: "gray", name: "Gray", swatch: "#8a8a8a", count: 2 },
  { id: "black", name: "Black", swatch: "#111111", count: 2 },
];

const img = (q: string) => `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=800&q=80`;

// Transparent-background product cutouts (TheMealDB ingredient PNGs).
const png = (name: string) => `https://www.themealdb.com/images/ingredients/${name}.png`;

export const products: Product[] = [
  {
    id: "am-bananas",
    name: "Organic Bananas, 1.1 lb Bunch",
    categoryId: "fruits-veg",
    brandId: "harvest",
    price: 79,
    compareAtPrice: 99,
    unit: "1.1 lb bunch",
    description: "Naturally ripened, thick-skinned bananas from small-batch growers.",
    image: png("Banana"),
    tag: "Peak season",
    badge: "organic",
    rating: 4.6,
    reviewCount: 128,
    color: "green",
    inStock: true,
    seller_id: "green-basket",
    store_name: "Green Basket",
  },
  {
    id: "am-tomatoes",
    name: "Vine Tomatoes, 1.1 lb",
    categoryId: "fruits-veg",
    brandId: "harvest",
    price: 64,
    compareAtPrice: 79,
    unit: "1.1 lb",
    description: "Juicy tomatoes ripened on the vine. Perfect for salads and slow-cooked curries.",
    image: png("Tomatoes"),
    rating: 4.4,
    reviewCount: 82,
    color: "red",
    inStock: true,
    seller_id: "green-basket",
    store_name: "Green Basket",
  },
  {
    id: "am-spinach",
    name: "Baby Spinach, Triple-Washed",
    categoryId: "fruits-veg",
    brandId: "orchard",
    price: 55,
    unit: "0.4 lb pack",
    description: "Tender, triple-washed baby spinach. Ready to eat right out of the bag.",
    image: png("Spinach"),
    badge: "organic",
    rating: 4.2,
    reviewCount: 44,
    color: "green",
    inStock: true,
    seller_id: "green-basket",
    store_name: "Green Basket",
  },
  {
    id: "am-avocado",
    name: "Hass Avocados, Ready to Eat",
    categoryId: "fruits-veg",
    brandId: "orchard",
    price: 199,
    compareAtPrice: 249,
    unit: "2 pcs",
    description: "Buttery, ripe-when-you-are Hass avocados. Sourced weekly.",
    image: png("Avocado"),
    tag: "Ready to eat",
    rating: 4.7,
    reviewCount: 210,
    color: "green",
    inStock: true,
    seller_id: "green-basket",
    store_name: "Green Basket",
  },
  {
    id: "am-rice",
    name: "Aged Basmati Rice, 2.2 lb",
    categoryId: "grocery-staples",
    brandId: "millhouse",
    price: 349,
    compareAtPrice: 399,
    unit: "2.2 lb",
    description: "Two-year aged long-grain basmati. Fluffs up beautifully every time.",
    image: png("Basmati Rice"),
    rating: 4.8,
    reviewCount: 342,
    color: "brown",
    inStock: true,
    seller_id: "freshmart-grocery",
    store_name: "FreshMart Grocery",
  },
  {
    id: "am-oil",
    name: "Cold-Pressed Mustard Oil, 1 L",
    categoryId: "grocery-staples",
    brandId: "millhouse",
    price: 285,
    compareAtPrice: 349,
    unit: "1 L bottle",
    description: "Kachi ghani mustard oil, cold-pressed and unrefined. Bold flavour, rich colour.",
    image: png("Olive Oil"),
    rating: 4.5,
    reviewCount: 95,
    color: "brown",
    inStock: true,
    seller_id: "spice-hub",
    store_name: "Spice Hub",
  },
  {
    id: "am-lentils",
    name: "Red Lentils, Stone-Cleaned 1.1 lb",
    categoryId: "grocery-staples",
    brandId: "millhouse",
    price: 129,
    unit: "1.1 lb",
    description: "Split red lentils, sorted and stone-cleaned. Cook in under 20 minutes.",
    image: png("Red Lentils"),
    rating: 4.3,
    reviewCount: 61,
    color: "red",
    inStock: true,
    seller_id: "freshmart-grocery",
    store_name: "FreshMart Grocery",
  },
  {
    id: "am-milk",
    name: "Farm Fresh Whole Milk, 1 L",
    categoryId: "breakfast-dairy",
    brandId: "daily",
    price: 68,
    unit: "1 L",
    description: "A2 whole milk, pasteurised and bottled within hours of milking.",
    image: png("Milk"),
    badge: "cold_sale",
    rating: 4.6,
    reviewCount: 178,
    color: "gray",
    inStock: true,
    seller_id: "daily-dairy",
    store_name: "Daily Dairy",
  },
  {
    id: "am-eggs",
    name: "Brown Farm Eggs, Pack of 12",
    categoryId: "breakfast-dairy",
    brandId: "daily",
    price: 149,
    compareAtPrice: 179,
    unit: "12 pcs",
    description: "Free-range brown eggs from small farms. Deep-orange yolks, thick whites.",
    image: png("Eggs"),
    tag: "Best seller",
    badge: "bestseller",
    rating: 4.9,
    reviewCount: 512,
    color: "brown",
    inStock: true,
    seller_id: "daily-dairy",
    store_name: "Daily Dairy",
  },
  {
    id: "am-yogurt",
    name: "Greek Yogurt, High Protein",
    categoryId: "breakfast-dairy",
    brandId: "daily",
    price: 95,
    unit: "0.4 lb",
    description: "Thick, strained yogurt with 10 g protein per serving. No added sugar.",
    image: png("Yogurt"),
    badge: "cold_sale",
    rating: 4.4,
    reviewCount: 88,
    color: "gray",
    inStock: true,
    seller_id: "daily-dairy",
    store_name: "Daily Dairy",
  },
  {
    id: "am-granola",
    name: "Honey Almond Granola, 0.7 lb",
    categoryId: "biscuits-snacks",
    brandId: "kitchen",
    price: 249,
    compareAtPrice: 299,
    unit: "0.7 lb",
    description: "Slow-baked oats with real honey and roasted almonds. No refined sugar.",
    image: png("Oats"),
    rating: 4.5,
    reviewCount: 76,
    color: "brown",
    inStock: true,
    seller_id: "quickbites-cafe",
    store_name: "QuickBites Cafe",
  },
  {
    id: "am-chips",
    name: "Kettle Chips, Sea Salt 0.3 lb",
    categoryId: "biscuits-snacks",
    brandId: "kitchen",
    price: 89,
    compareAtPrice: 109,
    unit: "0.3 lb",
    description: "Hand-cooked in small batches. Extra crunch, just the right salt.",
    image: png("Potatoes"),
    rating: 4.3,
    reviewCount: 54,
    color: "black",
    inStock: true,
    seller_id: "quickbites-cafe",
    store_name: "QuickBites Cafe",
  },
  {
    id: "am-bread",
    name: "Artisan Sourdough Loaf, 1 lb",
    categoryId: "breads-bakery",
    brandId: "harvest",
    price: 180,
    compareAtPrice: 220,
    unit: "1 lb loaf",
    description: "Naturally leavened, 24-hour ferment. Crisp crust, open crumb.",
    image: png("Bread"),
    rating: 4.8,
    reviewCount: 187,
    color: "brown",
    inStock: true,
    seller_id: "bake-bliss",
    store_name: "Bake Bliss",
  },
  {
    id: "am-honey",
    name: "Wildflower Honey, 0.6 lb Jar",
    categoryId: "grocery-staples",
    brandId: "orchard",
    price: 320,
    unit: "0.6 lb jar",
    description: "Raw, unfiltered honey from Himalayan foothills. Floral and mellow.",
    image: png("Honey"),
    badge: "organic",
    rating: 4.6,
    reviewCount: 71,
    color: "brown",
    inStock: false,
    seller_id: "organic-harvest",
    store_name: "Organic Harvest",
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function productsByCategory(categoryId: string) {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getStoreBySlug(slug: string) {
  return stores.find((v) => v.slug === slug);
}

export function productsByStore(storeId: string) {
  return products.filter((p) => p.seller_id === storeId);
}

export function storesByCategory(categoryId: string) {
  return stores.filter((v) => v.categoryId === categoryId);
}

export function discountPct(p: Product) {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
  return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
}

export type OrderStatus = "placed" | "packed" | "out_for_delivery" | "delivered";

export type Order = {
  id: string;
  placedAt: string;
  items: { productId: string; qty: number; price: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  etaMinutes?: number;
  address: string;
};

export const pastOrders: Order[] = [
  {
    id: "AM-9402",
    placedAt: "2026-07-04T10:12:00Z",
    items: [
      { productId: "am-bananas", qty: 2, price: 79 },
      { productId: "am-bread", qty: 1, price: 180 },
      { productId: "am-milk", qty: 2, price: 68 },
    ],
    subtotal: 474,
    delivery: 0,
    total: 474,
    status: "out_for_delivery",
    etaMinutes: 14,
    address: "Flat 402, Sector 62, Noida",
  },
  {
    id: "AM-8829",
    placedAt: "2026-07-01T18:40:00Z",
    items: [
      { productId: "am-avocado", qty: 1, price: 199 },
      { productId: "am-tomatoes", qty: 2, price: 64 },
    ],
    subtotal: 327,
    delivery: 29,
    total: 356,
    status: "delivered",
    address: "Flat 402, Sector 62, Noida",
  },
  {
    id: "AM-8551",
    placedAt: "2026-06-24T09:05:00Z",
    items: [
      { productId: "am-rice", qty: 1, price: 349 },
      { productId: "am-lentils", qty: 2, price: 129 },
      { productId: "am-oil", qty: 1, price: 285 },
    ],
    subtotal: 892,
    delivery: 0,
    total: 892,
    status: "delivered",
    address: "Flat 402, Sector 62, Noida",
  },
];
