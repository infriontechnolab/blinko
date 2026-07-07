import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Heart,
  Share2,
  Repeat,
  Truck,
  CreditCard,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import { getProduct, products, categories, discountPct } from "@/lib/mock-data";
import { useCart, formatPrice } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { ProductCard } from "@/components/product-card";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { BRAND } from "@/lib/brand";

// Deterministic sample reviews (static demo — no backend).
const SAMPLE_REVIEWS = [
  {
    name: "Aarav M.",
    stars: 5,
    date: "January 9, 2026",
    text: "Fresh and exactly as described. Delivery landed in under 20 minutes.",
  },
  {
    name: "Priya S.",
    stars: 4,
    date: "January 5, 2026",
    text: "Good quality and well packed. Will happily order this again.",
  },
  {
    name: "Rohan K.",
    stars: 5,
    date: "December 28, 2025",
    text: "Consistently reliable — this has become my weekly staple.",
  },
];

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — ${BRAND.name}` },
          { name: "description", content: loaderData.product.description },
        ]
      : [{ title: `Product — ${BRAND.name}` }],
  }),
  component: PDP,
  pendingComponent: ProductDetailSkeleton,
});

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${
            i <= Math.round(rating)
              ? "fill-[#f59e0b] text-[#f59e0b]"
              : "fill-transparent text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

function PDP() {
  const { product } = Route.useLoaderData();
  const { add, setDrawerOpen } = useCart();
  const { has, toggle } = useWishlist();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<"desc" | "info" | "reviews">("desc");
  const [rvRating, setRvRating] = useState(0);
  const [rvName, setRvName] = useState("");
  const [rvText, setRvText] = useState("");

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rvRating || !rvText.trim()) {
      toast.error("Pick a rating and write a short review.");
      return;
    }
    toast.success("Thanks! Your review has been submitted.");
    setRvRating(0);
    setRvName("");
    setRvText("");
  };

  // Synthesize a star distribution that averages near the product rating.
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const weight = Math.max(0.04, 1 - Math.abs(star - product.rating) * 0.8);
    return { star, weight };
  });
  const weightSum = breakdown.reduce((a, b) => a + b.weight, 0);
  const counts = breakdown.map((b) => Math.round((b.weight / weightSum) * product.reviewCount));
  const maxCount = Math.max(...counts, 1);

  const discount = discountPct(product);
  const liked = has(product.id);
  const category = categories.find((c) => c.id === product.categoryId);
  const sku = product.id.replace(/^am-/, "AM-").toUpperCase();

  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const onAdd = () => {
    add(product.id, qty);
    setAdded(true);
    setDrawerOpen(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const specs: [string, string][] = [
    ["Category", category?.name ?? product.categoryId],
    ["Pack size", product.unit],
    ["Storage", "Refrigerate on arrival"],
    ["Country of origin", "India"],
    ["Shelf life", "Best within 5–7 days"],
  ];

  const infoCards = [
    {
      icon: Truck,
      title: "Delivery in 18 minutes.",
      text: "Free on orders over $6. Fresh from the nearest store to your door.",
    },
    {
      icon: CreditCard,
      title: "Flexible payment.",
      text: "UPI, cards, wallets, or cash on delivery — pick what suits you at checkout.",
    },
    {
      icon: ShieldCheck,
      title: "Easy returns.",
      text: "Not happy with an item? Return it on delivery, no questions asked.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        {category ? (
          <>
            <Link to="/browse" search={{ category: category.id }} className="hover:text-foreground">
              {category.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Gallery — 7 cols */}
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-white">
            {/* Badges */}
            <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
              {discount > 0 ? (
                <span className="rounded-md bg-sale px-2.5 py-1 text-xs font-bold text-sale-foreground shadow-sm">
                  {discount}%
                </span>
              ) : null}
              {product.badge === "organic" ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-success px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-success-foreground">
                  <Leaf className="size-3" /> Organic
                </span>
              ) : null}
            </div>
            <div className="aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="size-full object-contain p-10"
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className={`aspect-square overflow-hidden rounded-lg border bg-white ${
                  i === 0 ? "border-foreground" : "border-border"
                }`}
              >
                <img
                  src={product.image}
                  alt=""
                  className="size-full object-contain p-2 opacity-90"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details — 5 cols */}
        <div className="flex flex-col lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {BRAND.name} · {product.unit}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold leading-tight md:text-4xl">
            {product.name}
          </h1>

          {/* Rating row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <Stars rating={product.rating} />
            <span className="rounded border border-border px-1.5 py-0.5 text-xs font-semibold">
              {product.rating.toFixed(2)}
            </span>
            <span className="text-muted-foreground">{product.reviewCount} reviews</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">
              SKU: <span className="font-mono text-foreground">{sku}</span>
            </span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-foreground/80">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-bold text-sale">{formatPrice(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            {discount > 0 ? (
              <span className="rounded-md bg-sale/10 px-2 py-1 text-xs font-bold text-sale">
                Save {discount}%
              </span>
            ) : null}
          </div>

          {/* Qty + Add to cart */}
          <div className="mt-6 flex items-stretch gap-3">
            <div className="inline-flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid size-11 place-items-center hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center font-mono text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid size-11 place-items-center hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={onAdd}
              disabled={!product.inStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                !product.inStock
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : added
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {added ? (
                <>
                  <Check className="size-4" /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag className="size-4" /> Add to cart · {formatPrice(product.price * qty)}
                </>
              )}
            </button>
          </div>

          {/* Info cards */}
          <div className="mt-6 space-y-3">
            {infoCards.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-primary">
                  <Icon className="size-4" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{title}</span> {text}
                </p>
              </div>
            ))}
          </div>

          {/* Wishlist / Share / Compare */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
            <button
              onClick={() => toggle(product.id)}
              className={`inline-flex items-center gap-2 font-medium transition-colors ${
                liked ? "text-sale" : "text-foreground hover:text-sale"
              }`}
            >
              <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
              {liked ? "In wishlist" : "Add to wishlist"}
            </button>
            <button className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary">
              <Share2 className="size-4" /> Share this product
            </button>
            <button className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary">
              <Repeat className="size-4" /> Compare
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex flex-wrap gap-6 border-b border-border">
          {[
            { id: "desc", label: "Description" },
            { id: "info", label: "Additional information" },
            { id: "reviews", label: `Reviews (${product.reviewCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "desc" ? (
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-foreground/80">
              <p>{product.description}</p>
              <p>
                Sourced to a single {BRAND.name} standard and quality-checked before it reaches
                your basket. Stored cold where it matters and delivered fast, so it arrives as
                fresh as it left the shelf.
              </p>
            </div>
          ) : null}

          {tab === "info" ? (
            <dl className="max-w-2xl divide-y divide-border rounded-2xl border border-border">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[160px_1fr] px-4 py-3 text-sm">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {tab === "reviews" ? (
            <div className="max-w-3xl">
              <h3 className="text-lg font-bold">
                {product.reviewCount} reviews for {product.name}
              </h3>

              {/* Summary + breakdown */}
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr]">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-bold">{product.rating.toFixed(2)}</span>
                  <div>
                    <Stars rating={product.rating} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Average of <span className="font-semibold text-foreground">{product.reviewCount} reviews</span>
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {breakdown.map((b, i) => (
                    <li key={b.star} className="flex items-center gap-3 text-xs">
                      <span className="inline-flex w-8 items-center gap-1 text-muted-foreground">
                        <Star className="size-3 fill-[#f59e0b] text-[#f59e0b]" />
                        {b.star}
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-[#f59e0b]"
                          style={{ width: `${(counts[i] / maxCount) * 100}%` }}
                        />
                      </span>
                      <span className="w-6 text-right font-mono text-muted-foreground">
                        {counts[i]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Review list */}
              <ul className="mt-8 divide-y divide-border border-t border-border">
                {SAMPLE_REVIEWS.map((r) => (
                  <li key={r.name} className="flex gap-4 py-6">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {r.name.charAt(0)}
                    </span>
                    <div>
                      <Stars rating={r.stars} />
                      <p className="mt-1 text-sm">
                        <span className="font-semibold">{r.name}</span>{" "}
                        <span className="text-muted-foreground">– {r.date}</span>
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{r.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Add a review */}
              <form onSubmit={submitReview} className="mt-8 border-t border-border pt-8">
                <h3 className="text-lg font-bold">Add a review</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your email address will not be published. Required fields are marked *
                </p>

                <div className="mt-5">
                  <label className="text-sm font-medium">Your rating *</label>
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRvRating(n)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        className="p-0.5"
                      >
                        <Star
                          className={`size-6 transition-colors ${
                            n <= rvRating
                              ? "fill-[#f59e0b] text-[#f59e0b]"
                              : "fill-transparent text-muted-foreground/40 hover:text-[#f59e0b]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="rv-text" className="text-sm font-medium">
                    Your review *
                  </label>
                  <textarea
                    id="rv-text"
                    value={rvText}
                    onChange={(e) => setRvText(e.target.value)}
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="Share what you liked…"
                  />
                </div>

                <div className="mt-5 max-w-sm">
                  <label htmlFor="rv-name" className="text-sm font-medium">
                    Name *
                  </label>
                  <input
                    id="rv-name"
                    value={rvName}
                    onChange={(e) => setRvName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="Your name"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Submit review
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="mt-14">
          <h2 className="mb-6 font-heading text-2xl font-bold">Related products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
