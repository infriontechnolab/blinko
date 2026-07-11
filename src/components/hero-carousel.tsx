import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Zap } from "lucide-react";
import { getProduct, getStoreBySlug, discountPct, stores } from "@/lib/mock-data";
import { formatPrice } from "@/lib/cart-store";
import { storeLogoUrl } from "@/components/store-card";

const AUTOPLAY_MS = 5500;

type ProductSlide = {
  kind: "product";
  eyebrow: string;
  title: string;
  subtitle: string;
  productId: string;
  chips: string[];
  cta: { label: string; to: string; search: Record<string, unknown> };
  // Per-slide palette — soft themed wash so every slide feels distinct.
  bg: string;
  accent: string;
};

// Spotlights the store-first catalog itself rather than a single product —
// its image slot is a small logo collage instead of a product photo.
type StoresSlide = {
  kind: "stores";
  eyebrow: string;
  title: string;
  subtitle: string;
  storeSlugs: string[];
  chips: string[];
  cta: { label: string; href: string };
  bg: string;
  accent: string;
};

type Slide = ProductSlide | StoresSlide;

const SLIDES: Slide[] = [
  {
    kind: "stores",
    eyebrow: "New: shop by store",
    title: "Every store you love, now in one app",
    subtitle: "Groceries, pharmacy, bakery, electronics and more — one seamless checkout.",
    storeSlugs: ["freshmart-grocery", "green-basket", "daily-dairy", "bake-bliss"],
    chips: ["One checkout", "One delivery"],
    cta: { label: "Explore all stores", href: "#all-stores" },
    bg: "linear-gradient(120deg, #eef2f8 0%, #f5f7fb 55%, #fcfdff 100%)",
    accent: "#3b6fa0",
  },
  {
    kind: "product",
    eyebrow: "Farm to doorstep in 18 minutes",
    title: "Fresh fruits & veggies, picked this morning",
    subtitle: "Sourced daily from local farms. No cold storage, no middlemen.",
    productId: "am-avocado",
    chips: ["100% Organic", "Free over $6"],
    cta: { label: "Shop fresh produce", to: "/browse", search: { category: "fruits-veg" } },
    bg: "linear-gradient(120deg, #eaf6e6 0%, #f6fbf2 55%, #fbfdf8 100%)",
    accent: "#4d8b3f",
  },
  {
    kind: "product",
    eyebrow: "Only this week",
    title: "Up to 40% off your first 3 orders",
    subtitle: "Stock the pantry for less — staples, dairy, snacks & more.",
    productId: "am-rice",
    chips: ["No code needed", "Free delivery"],
    cta: { label: "Grab the deals", to: "/browse", search: { sale: true } },
    bg: "linear-gradient(120deg, #fdeae6 0%, #fef4f1 55%, #fffbfa 100%)",
    accent: "#c2410c",
  },
  {
    kind: "product",
    eyebrow: "Morning essentials",
    title: "Farm-fresh dairy at your door by dawn",
    subtitle: "Milk, eggs & yogurt delivered cold before you wake up.",
    productId: "am-milk",
    chips: ["Cold-chain fresh", "Daily delivery"],
    cta: { label: "Shop dairy", to: "/browse", search: { category: "breakfast-dairy" } },
    bg: "linear-gradient(120deg, #e7f0fa 0%, #f2f7fc 55%, #fafcff 100%)",
    accent: "#3b6fa0",
  },
  {
    kind: "product",
    eyebrow: "Baked & bottled fresh",
    title: "Artisan sourdough & wildflower honey",
    subtitle: "Slow-baked loaves and raw honey from small-batch makers.",
    productId: "am-bread",
    chips: ["Small-batch", "Preservative-free"],
    cta: { label: "Shop bakery", to: "/browse", search: { category: "breads-bakery" } },
    bg: "linear-gradient(120deg, #f6efe2 0%, #faf5ec 55%, #fefcf8 100%)",
    accent: "#a16207",
  },
];

function Stars({ rating, accent }: { rating: number; accent: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="size-3.5"
          style={{
            fill: i <= Math.round(rating) ? accent : "transparent",
            color: i <= Math.round(rating) ? accent : "rgba(0,0,0,0.2)",
          }}
        />
      ))}
    </span>
  );
}

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setActive((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (
      paused ||
      (typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }
    const t = setInterval(() => setActive((n) => (n + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, active]);

  const slide = SLIDES[active];
  const product = slide.kind === "product" ? getProduct(slide.productId)! : null;
  const off = product ? discountPct(product) : 0;
  const avgStoreRating = stores.reduce((sum, s) => sum + s.rating, 0) / stores.length;

  return (
    <section
      className={`relative flex min-h-[420px] overflow-hidden rounded-2xl border border-border md:min-h-[440px] ${
        paused ? "hero-paused" : ""
      }`}
      style={{ background: slide.bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured departments"
    >
      {/* Ambient blobs — themed, drifting behind content. */}
      <div
        key={`blob-${active}`}
        className="hero-blob pointer-events-none absolute -right-16 -top-20 size-72 rounded-full blur-3xl md:size-96"
        style={{ background: slide.accent, opacity: 0.14 }}
        aria-hidden
      />
      <div
        className="hero-blob pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full blur-3xl"
        style={{ background: slide.accent, opacity: 0.1, animationDelay: "-8s" }}
        aria-hidden
      />

      <div className="relative z-10 grid w-full grid-cols-1 items-center gap-6 p-7 md:grid-cols-2 md:gap-4 md:p-12">
        {/* Copy — staggered reveal, re-keyed per slide. */}
        <div key={`copy-${active}`} className="md:pr-4">
          <span
            className="hero-rise inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur"
            style={{ color: slide.accent, animationDelay: "0.05s" }}
          >
            <Zap className="size-3" style={{ fill: slide.accent }} />
            {slide.eyebrow}
          </span>

          <h1
            className="hero-rise mt-4 text-balance text-3xl font-bold leading-[1.08] text-foreground md:text-[2.6rem]"
            style={{ animationDelay: "0.12s" }}
          >
            {slide.title}
          </h1>

          <p
            className="hero-rise mt-3 max-w-md text-sm text-muted-foreground md:text-[15px]"
            style={{ animationDelay: "0.2s" }}
          >
            {slide.subtitle}
          </p>

          {/* Rating + price, or store stats for the stores slide */}
          <div
            className="hero-rise mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
            style={{ animationDelay: "0.28s" }}
          >
            {slide.kind === "product" ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Stars rating={product!.rating} accent={slide.accent} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {product!.rating.toFixed(1)} ({product!.reviewCount})
                  </span>
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-sale">
                    {formatPrice(product!.price)}
                  </span>
                  {product!.compareAtPrice ? (
                    <span className="font-mono text-sm text-muted-foreground line-through">
                      {formatPrice(product!.compareAtPrice)}
                    </span>
                  ) : null}
                </span>
              </>
            ) : (
              <>
                <span className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold text-foreground">
                    {stores.length}
                  </span>
                  <span className="text-xs text-muted-foreground">stores</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Stars rating={avgStoreRating} accent={slide.accent} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {avgStoreRating.toFixed(1)} avg rating
                  </span>
                </span>
              </>
            )}
          </div>

          {/* CTA + trust chips */}
          <div
            className="hero-rise mt-6 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.36s" }}
          >
            {slide.kind === "product" ? (
              <Link
                to={slide.cta.to}
                search={slide.cta.search}
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {slide.cta.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <a
                href={slide.cta.href}
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {slide.cta.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            )}
            <div className="flex flex-wrap gap-2">
              {slide.chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-surface/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product image — glowing floated shot with a discount coin —
            or a small store-logo collage for the stores slide. */}
        <div key={`img-${active}`} className="hero-pop relative mx-auto w-full max-w-sm">
          <div
            className="hero-glow absolute inset-6 rounded-full blur-2xl"
            style={{ background: slide.accent, opacity: 0.35 }}
            aria-hidden
          />
          {slide.kind === "stores" ? (
            <div className="hero-float relative grid grid-cols-2 place-items-center gap-4">
              {slide.storeSlugs.map((slug) => {
                const s = getStoreBySlug(slug);
                if (!s) return null;
                return (
                  <div
                    key={slug}
                    className="grid size-28 place-items-center rounded-3xl border-4 border-surface bg-white p-4 shadow-xl"
                  >
                    <img src={storeLogoUrl(s)} alt={s.name} className="size-full object-contain" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="hero-float relative">
              <img
                src={product!.image}
                alt={product!.name}
                className="relative z-10 mx-auto aspect-square w-full max-w-[340px] object-contain drop-shadow-2xl"
              />
              {off > 0 ? (
                <span
                  className="absolute right-2 top-2 z-20 flex size-16 flex-col items-center justify-center rounded-full text-center font-bold leading-none text-white shadow-lg md:right-6"
                  style={{ background: slide.accent }}
                >
                  <span className="text-lg">{off}%</span>
                  <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">
                    off
                  </span>
                </span>
              ) : null}
            </div>
          )}
          <p className="relative z-10 mt-2 text-center text-sm font-semibold text-foreground">
            {slide.kind === "stores" ? `${stores.length} stores and counting` : product!.name}
          </p>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(active - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background md:grid"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={() => go(active + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background md:grid"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Progress dots — active dot fills over the autoplay interval. */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className={`h-2 overflow-hidden rounded-full bg-foreground/20 transition-all ${
              i === active ? "w-8" : "w-2 hover:bg-foreground/35"
            }`}
          >
            {i === active ? (
              <span
                key={`fill-${active}`}
                className="hero-progress-fill block h-full rounded-full"
                style={{ background: slide.accent, animationDuration: `${AUTOPLAY_MS}ms` }}
              />
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
