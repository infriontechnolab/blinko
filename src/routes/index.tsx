import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { HeroCarousel } from "@/components/hero-carousel";
import { PromoBannerRow } from "@/components/promo-banner-row";
import { BestSellersTabs } from "@/components/best-sellers-tabs";
import { PromoMosaic } from "@/components/promo-mosaic";
import { HomeCategoryRail } from "@/components/home-category-rail";
import { useCategoriesPanel } from "@/lib/categories-panel";
import { products } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const newArrivals = products.slice(0, 4);
  const featured = products.slice(4, 8);
  const { open: catsOpen } = useCategoriesPanel();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      {/* Hero: category rail + wide banner */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          catsOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-1"
        }`}
      >
        {catsOpen ? (
          <aside id="home-categories-panel" className="hidden lg:block">
            <HomeCategoryRail />
          </aside>
        ) : null}
        <HeroCarousel />
      </div>

      {/* Feature strip — 4 up */}
      <section className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Leaf, label: "Farm-direct freshness", note: "Sourced daily" },
          { icon: Truck, label: "18-minute delivery", note: "Free over $6" },
          { icon: ShieldCheck, label: "Quality assured", note: `The ${BRAND.name} promise` },
          { icon: RotateCcw, label: "Easy returns", note: "No questions asked" },
        ].map(({ icon: Icon, label, note }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Three wide promo banners */}
      <PromoBannerRow />

      {/* New Arrivals */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">New arrivals</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Special discounts, just for this week.
            </p>
          </div>
          <Link to="/browse" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Four tall promo banners */}
      <PromoMosaic />

      {/* Featured Products */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Featured products</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Don't miss this week's offers.
            </p>
          </div>
          <Link to="/browse" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Best sellers — tabbed by aisle */}
      <BestSellersTabs />
    </div>
  );
}
