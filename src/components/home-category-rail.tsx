import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Leaf, Wheat, Egg, Cookie, Soup, type LucideIcon } from "lucide-react";
import { categories, productsByCategory } from "@/lib/mock-data";

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
  const subProducts = active ? productsByCategory(active).slice(0, 6) : [];

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      <nav className="overflow-hidden rounded-md border border-border bg-surface">
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
                  className={`flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "border-primary bg-muted text-primary"
                      : "border-transparent text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{c.name}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Submenu flyout */}
      {activeCategory && subProducts.length > 0 ? (
        <div className="absolute left-full top-0 z-40 hidden h-full w-64 rounded-r-md border border-l-0 border-border bg-surface p-5 shadow-xl lg:block">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm font-bold text-foreground">{activeCategory.name}</p>
            <Link
              to="/browse"
              search={{ category: activeCategory.id }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Shop all →
            </Link>
          </div>
          <ul className="space-y-2">
            {subProducts.map((p) => (
              <li key={p.id}>
                <Link
                  to="/products/$id"
                  params={{ id: p.id }}
                  className="block text-sm text-foreground/80 transition-colors hover:text-primary"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
