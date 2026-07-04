import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getProduct } from "@/lib/mock-data";
import { formatPrice } from "@/lib/cart-store";

type Slide = {
  categoryId: string;
  eyebrow: string;
  title: string;
  productId: string;
};

// Each slide leads with one department and one clean product shot.
const SLIDES: Slide[] = [
  { categoryId: "ready", eyebrow: "Kitchen off tonight", title: "Chef-made meals, just heat and eat", productId: "am-paneer-tikka" },
  { categoryId: "produce", eyebrow: "Fresh this week", title: "Ripe, ready, at your door in minutes", productId: "am-avocado" },
  { categoryId: "pantry", eyebrow: "Pantry restock", title: "Two-year aged basmati and staples", productId: "am-rice" },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  const go = useCallback((n: number) => setActive((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const t = setInterval(() => {
      if (!paused.current) setActive((n) => (n + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[active];
  const product = getProduct(slide.productId)!;

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-muted"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      aria-roledescription="carousel"
      aria-label="Featured departments"
    >
      <div className="grid grid-cols-1 items-center gap-6 p-7 md:min-h-[380px] md:grid-cols-2 md:gap-4 md:p-12">
        {/* Copy */}
        <div key={`copy-${active}`} className="animate-in fade-in duration-500 md:pr-4">
          <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {slide.eyebrow}
          </span>
          <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.1] text-foreground md:text-4xl">
            {slide.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to="/browse"
              search={{ category: slide.categoryId }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop now <ArrowRight className="size-4" />
            </Link>
            <p className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-sale">{formatPrice(product.price)}</span>
              {product.compareAtPrice ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Product image */}
        <div
          key={`img-${active}`}
          className="relative mx-auto aspect-[5/4] w-full max-w-sm animate-in fade-in duration-500"
        >
          <img
            src={product.image}
            alt={product.name}
            className="size-full rounded-xl object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={() => go(active - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background md:grid"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={() => go(active + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background md:grid"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.categoryId}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-ink" : "w-2 bg-foreground/25 hover:bg-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
