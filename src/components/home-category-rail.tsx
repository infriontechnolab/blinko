import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Leaf, Wheat, Egg, Cookie, Soup, type LucideIcon } from "lucide-react";
import { categories, productsByCategory } from "@/lib/mock-data";
import { formatPrice } from "@/lib/cart-store";

const departmentIcons: Record<string, LucideIcon> = {
  produce: Leaf,
  pantry: Wheat,
  dairy: Egg,
  snacks: Cookie,
  ready: Soup,
};

export function HomeCategoryRail() {
  const [active, setActive] = useState<string | null>(null);
  const activeCategory = categories.find((c) => c.id === active);
  const flyoutProducts = active ? productsByCategory(active).slice(0, 4) : [];

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      <nav className="overflow-hidden rounded-xl border border-border bg-surface">
        <p className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
          Shop by department
        </p>
        <ul>
          {categories.map((c) => {
            const Icon = departmentIcons[c.id] ?? Leaf;
            const isActive = active === c.id;
            return (
              <li key={c.id}>
                <Link
                  to="/browse"
                  search={{ category: c.id }}
                  onMouseEnter={() => setActive(c.id)}
                  onFocus={() => setActive(c.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive ? "bg-muted text-primary" : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 font-medium">{c.name}</span>
                  <ChevronRight className="size-4 text-muted-foreground/50" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Flyout: top products in the hovered department */}
      {activeCategory && flyoutProducts.length > 0 ? (
        <div className="absolute left-full top-0 z-40 ml-2 hidden w-[380px] rounded-2xl border border-border bg-surface p-4 shadow-xl lg:block">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <p className="text-base font-bold text-foreground">{activeCategory.name}</p>
              <p className="text-xs text-muted-foreground">{activeCategory.tagline}</p>
            </div>
            <Link
              to="/browse"
              search={{ category: activeCategory.id }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Shop all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {flyoutProducts.map((p) => (
              <Link
                key={p.id}
                to="/products/$id"
                params={{ id: p.id }}
                className="group flex items-center gap-2 rounded-xl border border-border p-2 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-white">
                  <img src={p.image} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-xs font-semibold text-foreground group-hover:text-primary">
                    {p.name}
                  </p>
                  <p className="font-mono text-[11px] font-bold text-sale">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
