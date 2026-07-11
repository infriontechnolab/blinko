import { Link } from "@tanstack/react-router";
import { Heart, Star, Minus, Plus, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/mock-data";
import { discountPct } from "@/lib/mock-data";
import { useCart, formatPrice } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";

const badgeStyles: Record<string, { label: string; className: string }> = {
  organic: { label: "Organic", className: "bg-success text-success-foreground" },
  cold_sale: { label: "Cold Sale", className: "bg-primary text-primary-foreground" },
  bestseller: { label: "Best Seller", className: "bg-accent text-accent-foreground" },
};

// Client-only offer countdown. Renders null on the server and first client
// paint (avoids hydration mismatch), then ticks once mounted.
function OfferCountdown({ hours }: { hours: number }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = Date.now() + hours * 3600 * 1000;
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [hours]);

  // Reserve the same line height before mount, so cards don't shift.
  if (left === null) return <div className="h-4" />;

  const s = Math.floor(left / 1000);
  const parts = [
    { v: Math.floor(s / 86400), l: "d" },
    { v: Math.floor((s % 86400) / 3600), l: "h" },
    { v: Math.floor((s % 3600) / 60), l: "m" },
    { v: s % 60, l: "s" },
  ];

  return (
    <div className="flex items-center gap-1 font-mono text-[10px]">
      <span className="text-muted-foreground">Ends in</span>
      {parts.map((p) => (
        <span
          key={p.l}
          className="rounded bg-muted px-1 py-0.5 font-semibold text-foreground"
        >
          {String(p.v).padStart(2, "0")}
          {p.l}
        </span>
      ))}
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3 ${
            i <= Math.round(rating)
              ? "fill-[#f59e0b] text-[#f59e0b]"
              : "fill-transparent text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  const list = layout === "list";
  const { items, add, setQty } = useCart();
  const { has, toggle } = useWishlist();
  const discount = discountPct(product);
  const badge = product.badge ? badgeStyles[product.badge] : null;
  const liked = has(product.id);
  const cartQty = items.find((i) => i.productId === product.id)?.qty ?? 0;

  const inc = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    add(product.id, 1);
  };

  const dec = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQty <= 0) return;
    setQty(product.id, cartQty - 1);
  };

  const onWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className={`group relative flex rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg ${
        list ? "flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative aspect-square shrink-0 overflow-hidden bg-white p-4 ${
          list
            ? "w-32 rounded-l-2xl sm:w-40"
            : "rounded-t-2xl"
        }`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        {discount > 0 ? (
          <span className="absolute left-2 top-2 rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-sale-foreground shadow-sm">
            {discount}%
          </span>
        ) : null}

        <button
          onClick={onWish}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/90 backdrop-blur transition-colors ${
            liked ? "text-sale" : "text-foreground/50 hover:text-sale"
          }`}
        >
          <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {badge ? (
          <span
            className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.className}`}
          >
            {product.badge === "organic" ? <Leaf className="size-3" /> : null}
            {badge.label}
          </span>
        ) : null}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="font-mono text-[10px] text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base font-bold text-sale">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span className="font-mono text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        {product.compareAtPrice ? (
          <OfferCountdown hours={40 * 24 + (product.reviewCount % 24)} />
        ) : (
          <p className="flex h-4 items-center text-[10px] text-muted-foreground">
            In stock · ready to ship
          </p>
        )}
        {/* Add-to-cart / quantity stepper — mt-auto keeps it pinned to the card base */}
        {product.inStock ? (
          cartQty > 0 ? (
            <div className="mt-auto flex items-center justify-between rounded-full border border-border p-1">
              <button
                onClick={dec}
                aria-label="Decrease quantity"
                className="grid size-8 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-6 text-center font-mono text-sm font-semibold">
                {cartQty}
              </span>
              <button
                onClick={inc}
                aria-label="Increase quantity"
                className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={inc}
              aria-label="Add to cart"
              className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Add to cart
            </button>
          )
        ) : (
          <p className="mt-auto rounded-full bg-muted py-2 text-center text-xs font-semibold text-muted-foreground">
            Out of stock
          </p>
        )}
      </div>
    </Link>
  );
}
