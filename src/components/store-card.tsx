import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import type { Store } from "@/lib/mock-data";

/**
 * Demo store logo — a generated avatar (store initials on their accent
 * color) so every store has a real logo image without needing hand-picked
 * asset files. `store.logo` still wins if a real one is ever added.
 */
export function storeLogoUrl(store: Store) {
  if (store.logo) return store.logo;
  const params = new URLSearchParams({
    name: store.name,
    background: store.accent.replace("#", ""),
    color: "fff",
    size: "128",
    bold: "true",
    format: "png",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      to="/store/$slug"
      params={{ slug: store.slug }}
      className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-white p-1.5">
        <img
          src={storeLogoUrl(store)}
          alt={`${store.name} logo`}
          loading="lazy"
          className="size-full object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
          {store.name}
        </h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">{store.tagline}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {store.deliveryTime}
        </p>
      </div>
    </Link>
  );
}
