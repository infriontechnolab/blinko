import { ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/cart-store";

/**
 * "You got everything you need?" — a lightweight review nudge shown before the
 * customer leaves the basket for checkout. Rendered from both the cart drawer
 * and the full basket page so every checkout path passes through it.
 */
export function CheckoutConfirm({
  open,
  itemCount,
  subtotal,
  onConfirm,
  onClose,
}: {
  open: boolean;
  itemCount: number;
  subtotal: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-confirm-title"
        className="relative z-10 w-full max-w-sm rounded-t-2xl bg-background p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="size-6" />
        </div>
        <h2 id="cart-confirm-title" className="mt-4 font-heading text-xl font-bold">
          You got everything you need?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You have {itemCount} {itemCount === 1 ? "item" : "items"} ({formatPrice(subtotal)}) in
          your basket. Take one more look before you check out.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Check className="size-4" /> Yes, proceed to checkout
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-border py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Keep shopping
          </button>
        </div>
      </div>
    </div>
  );
}
