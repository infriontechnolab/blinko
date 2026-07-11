import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Apple,
  Beef,
  Milk,
  Croissant,
  CupSoda,
  Snowflake,
  Cookie,
  Wheat,
  House,
  HeartPulse,
  Baby,
  Smartphone,
  Shirt,
  PawPrint,
  Sparkles,
  PenLine,
  BadgePercent,
  type LucideIcon,
} from "lucide-react";
import { categories } from "@/lib/mock-data";

const categoryIcons: Record<string, LucideIcon> = {
  "fruits-veg": Apple,
  "meats-seafood": Beef,
  "breakfast-dairy": Milk,
  "breads-bakery": Croissant,
  beverages: CupSoda,
  frozen: Snowflake,
  "biscuits-snacks": Cookie,
  "grocery-staples": Wheat,
  household: House,
  healthcare: HeartPulse,
  baby: Baby,
  electronics: Smartphone,
  fashion: Shirt,
  "pet-supplies": PawPrint,
  beauty: Sparkles,
  stationery: PenLine,
};

export function HomeCategoryRail() {
  const [active, setActive] = useState<string | null>(null);
  const activeCategory = categories.find((c) => c.id === active);
  const subs = activeCategory?.subcategories ?? [];

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      <nav className="overflow-hidden rounded-md border border-border bg-surface">
        <ul>
          <li className="border-b border-border">
            <Link
              to="/offers"
              className="flex items-center gap-3 border-l-2 border-transparent bg-sale/5 px-4 py-2.5 text-sm font-semibold text-sale transition-colors hover:border-sale hover:bg-sale/10"
            >
              <BadgePercent className="size-4 shrink-0" />
              <span className="flex-1">Offers</span>
            </Link>
          </li>
          {categories.map((c) => {
            const Icon = categoryIcons[c.id] ?? Apple;
            const isActive = active === c.id;
            const hasSubs = c.subcategories.length > 0;
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
                  {hasSubs ? (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Subcategory flyout */}
      {activeCategory && subs.length > 0 ? (
        <div className="absolute left-full top-0 z-40 hidden min-h-full w-72 rounded-r-md border border-l-0 border-border bg-surface p-5 shadow-xl lg:block">
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
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {subs.map((s) => (
              <li key={s.id}>
                <Link
                  to="/browse"
                  search={{ category: activeCategory.id }}
                  className="block text-sm text-foreground/80 transition-colors hover:text-primary"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
