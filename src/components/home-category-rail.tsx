import { Link } from "@tanstack/react-router";
import {
  ShoppingBasket,
  Apple,
  Milk,
  Croissant,
  CupSoda,
  Pill,
  Sparkles,
  Baby,
  PawPrint,
  Smartphone,
  Shirt,
  House,
  PenLine,
  Leaf,
  BadgePercent,
  type LucideIcon,
} from "lucide-react";
import { storeCategories } from "@/lib/mock-data";

const storeCategoryIcons: Record<string, LucideIcon> = {
  grocery: ShoppingBasket,
  "fruits-vegetables": Apple,
  dairy: Milk,
  bakery: Croissant,
  "food-beverages": CupSoda,
  pharmacy: Pill,
  "beauty-personal-care": Sparkles,
  "baby-care": Baby,
  "pet-supplies": PawPrint,
  electronics: Smartphone,
  fashion: Shirt,
  "home-kitchen": House,
  stationery: PenLine,
  "organic-products": Leaf,
};

export function HomeCategoryRail() {
  return (
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
        {storeCategories.map((c) => {
          const Icon = storeCategoryIcons[c.id] ?? ShoppingBasket;
          return (
            <li key={c.id}>
              <Link
                to="/"
                search={{ category: c.id }}
                className="flex items-center gap-3 border-l-2 border-transparent px-4 py-2.5 text-sm text-foreground transition-colors hover:border-primary hover:bg-muted/60 hover:text-primary"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">{c.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
