import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Truck, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeCategoryRail } from "@/components/home-category-rail";
import { useCategoriesPanel } from "@/lib/categories-panel";
import { categories, products } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const featured = products.slice(0, 4);
  const pantry = products.filter((p) => p.categoryId === "grocery-staples").slice(0, 4);
  const ready = products.filter((p) => p.categoryId === "frozen");
  const { open: catsOpen } = useCategoriesPanel();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Hero: toggleable "All Categories" panel + carousel */}
      <div
        className={`grid grid-cols-1 gap-4 ${catsOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-1"}`}
      >
        {catsOpen ? (
          <aside id="home-categories-panel" className="hidden lg:block">
            <HomeCategoryRail />
          </aside>
        ) : null}
        <HeroCarousel />
      </div>

      {/* Value strip */}
      <section className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-3">
        {[
          { icon: Leaf, label: "Farm-direct freshness", note: "Sourced daily" },
          { icon: Truck, label: "18-minute delivery", note: "Free over ₹499" },
          { icon: ShieldCheck, label: "One quality standard", note: "The Apna Mandi promise" },
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

      {/* Categories */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Shop by aisle</h2>
          <Link to="/browse" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/browse"
              search={{ category: c.id }}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary/40"
            >
              <div className="flex aspect-[4/3] w-full items-end bg-muted p-4">
                <span className="text-xl font-bold leading-none text-foreground">
                  {c.name.split(" ")[0]}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured shelf */}
      <section className="mt-14">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">This week's shelf</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Split promo */}
      <section className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-ink p-8 text-background">
          <p className="text-xs text-background/60">Ready-to-eat</p>
          <h3 className="mt-2 text-2xl font-bold">Kitchen off. Meal on.</h3>
          <p className="mt-3 max-w-sm text-sm text-background/70">
            Slow-cooked classics packed at 4pm, at your door by 7.
          </p>
          <Link
            to="/browse"
            search={{ category: "frozen" }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground"
          >
            Shop ready meals <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-muted p-8">
          <p className="text-xs text-muted-foreground">Pantry</p>
          <h3 className="mt-2 text-2xl font-bold">Restock the essentials.</h3>
          <p className="mt-3 max-w-sm text-sm text-foreground/70">
            Rice, oil, dals and grains — the everyday things, sorted.
          </p>
          <Link
            to="/browse"
            search={{ category: "grocery-staples" }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Shop pantry <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Pantry shelf */}
      <section className="mt-14">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Everyday essentials</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {pantry.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Ready shelf */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              04 · Ready-to-eat
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold">Meals in minutes</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ready.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
