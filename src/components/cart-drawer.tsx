import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Minus, X, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, formatPrice } from "@/lib/cart-store";
import { getProduct } from "@/lib/mock-data";
import { CheckoutConfirm } from "@/components/checkout-confirm";

export function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, setQty, remove } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [drawerOpen]);

  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Amounts are INR (÷83 on display): free delivery over ~$35.
  const deliveryFree = subtotal >= 2905;
  const toFree = Math.max(0, 2905 - subtotal);

  const proceedToCheckout = () => {
    setConfirmOpen(false);
    setDrawerOpen(false);
    navigate({ to: "/checkout" });
  };

  return (
    <>
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl transition-transform ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Your basket
            </p>
            <h2 className="font-heading text-xl font-bold">
              {items.length} {items.length === 1 ? "item" : "items"}
            </h2>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="grid size-9 place-items-center rounded-full hover:bg-muted"
            aria-label="Close basket"
          >
            <X className="size-4" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-kraft">
              <ShoppingBag className="size-6 text-kraft-dark" />
            </div>
            <p className="font-heading text-lg font-semibold">Your basket is empty</p>
            <p className="text-sm text-muted-foreground">
              Add fresh picks, pantry staples, or a carton of milk.
            </p>
            <Link
              to="/browse"
              onClick={() => setDrawerOpen(false)}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {items.map((it) => {
                const p = getProduct(it.productId);
                if (!p) return null;
                return (
                  <li key={it.productId} className="flex gap-3 px-5 py-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.unit}</p>
                        </div>
                        <button
                          onClick={() => remove(it.productId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${p.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-md border border-border">
                          <button
                            onClick={() => setQty(it.productId, it.qty - 1)}
                            className="grid size-7 place-items-center hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs">{it.qty}</span>
                          <button
                            onClick={() => setQty(it.productId, it.qty + 1)}
                            className="grid size-7 place-items-center hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="font-mono text-sm font-medium">
                          {formatPrice(p.price * it.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-border bg-muted/40 p-5">
              {!deliveryFree ? (
                <div className="mb-3 rounded-lg bg-kraft/60 px-3 py-2 text-xs text-foreground">
                  Add <span className="font-mono font-medium">{formatPrice(toFree)}</span> more for free delivery.
                </div>
              ) : (
                <div className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                  Free delivery unlocked.
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono text-base font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={() => setConfirmOpen(true)}
                className="mt-4 grid w-full place-items-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
              >
                Checkout — {formatPrice(subtotal + (deliveryFree ? 0 : 414))}
              </button>
              <Link
                to="/cart"
                onClick={() => setDrawerOpen(false)}
                className="mt-2 grid w-full place-items-center rounded-lg border border-border py-2.5 text-xs font-semibold"
              >
                View full basket
              </Link>
            </footer>
          </>
        )}
      </aside>

      <CheckoutConfirm
        open={confirmOpen}
        itemCount={items.length}
        subtotal={subtotal}
        onConfirm={proceedToCheckout}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
