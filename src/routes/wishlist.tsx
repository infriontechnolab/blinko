import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { getProduct, type Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: `Wishlist — ${BRAND.name}` }] }),
  component: Wishlist,
});

function Wishlist() {
  const { ids } = useWishlist();
  const items = ids
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Saved for later
        </p>
        <h1 className="mt-1 font-heading text-4xl font-bold">
          Your wishlist
          {items.length > 0 ? (
            <span className="ml-2 align-middle font-mono text-lg font-medium text-muted-foreground">
              ({items.length})
            </span>
          ) : null}
        </h1>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-20 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-background text-muted-foreground/60">
            <Heart className="size-6" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold">Nothing saved yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any product to keep it here for later.
          </p>
          <Link
            to="/browse"
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Browse the store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
