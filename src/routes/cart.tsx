import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-store";
import { getProduct } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: `Your basket — ${BRAND.name}` }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 29;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-kraft">
          <ShoppingBag className="size-7 text-kraft-dark" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Your basket is empty</h1>
        <p className="text-sm text-muted-foreground">
          Fresh picks, pantry staples, everyday essentials — you know the drill.
        </p>
        <Link
          to="/browse"
          className="mt-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Your basket
        </p>
        <h1 className="mt-1 font-heading text-4xl font-bold">
          {items.length} {items.length === 1 ? "item" : "items"} ready to go
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {items.map((it) => {
            const p = getProduct(it.productId);
            if (!p) return null;
            return (
              <li key={it.productId} className="flex gap-4 p-4">
                <Link
                  to="/products/$id"
                  params={{ id: p.id }}
                  className="size-24 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  <img src={p.image} alt={p.name} className="size-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {BRAND.name}
                      </p>
                      <Link
                        to="/products/$id"
                        params={{ id: p.id }}
                        className="mt-0.5 line-clamp-1 text-base font-semibold hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.unit}</p>
                    </div>
                    <button
                      onClick={() => remove(p.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div className="inline-flex items-center rounded-md border border-border">
                      <button
                        onClick={() => setQty(p.id, it.qty - 1)}
                        className="grid size-8 place-items-center hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm">{it.qty}</span>
                      <button
                        onClick={() => setQty(p.id, it.qty + 1)}
                        className="grid size-8 place-items-center hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-base font-semibold">
                        {formatPrice(p.price * it.qty)}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {formatPrice(p.price)} × {it.qty}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Order summary
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-mono">
                {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-heading text-lg font-bold">Total</span>
            <span className="font-mono text-2xl font-bold">{formatPrice(total)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-6 grid w-full place-items-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
          >
            Proceed to checkout
          </Link>
          <Link
            to="/browse"
            className="mt-2 grid w-full place-items-center rounded-lg border border-border py-2.5 text-xs font-semibold"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
