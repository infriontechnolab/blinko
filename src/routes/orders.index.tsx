import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package } from "lucide-react";
import { pastOrders, type Order } from "@/lib/mock-data";
import { formatPrice } from "@/lib/cart-store";
import { useOrders, useNow, hydrateOrder } from "@/lib/orders-store";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: `Your orders — ${BRAND.name}` }] }),
  component: Orders,
});

const statusLabels: Record<string, { label: string; tone: string }> = {
  placed: { label: "Placed", tone: "bg-muted text-foreground" },
  packed: { label: "Packed", tone: "bg-kraft text-foreground" },
  out_for_delivery: { label: "Out for delivery", tone: "bg-primary/15 text-primary" },
  delivered: { label: "Delivered", tone: "bg-primary text-primary-foreground" },
};

function Orders() {
  const { stored } = useOrders();
  const now = useNow(15_000);

  // Freshly placed orders (live status) first, then the static history. Once
  // the clock has ticked, sort everything newest-first.
  const orders: Order[] = [
    ...stored.map((o) => hydrateOrder(o, now || Date.now())),
    ...pastOrders,
  ].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Order history
        </p>
        <h1 className="mt-1 font-heading text-4xl font-bold">Your orders</h1>
      </header>

      <ul className="space-y-4">
        {orders.map((o) => {
          const s = statusLabels[o.status];
          const totalItems = o.items.reduce((a, b) => a + b.qty, 0);
          return (
            <li
              key={o.id}
              className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-xl bg-kraft text-kraft-dark">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Order · <span className="text-foreground">#{o.id}</span>
                    </p>
                    <p className="mt-0.5 font-heading text-lg font-bold">
                      {totalItems} {totalItems === 1 ? "item" : "items"} ·{" "}
                      <span className="font-mono">{formatPrice(o.total)}</span>
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {new Date(o.placedAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${s.tone}`}
                  >
                    {s.label}
                    {o.status === "out_for_delivery" && o.etaMinutes ? ` · ${o.etaMinutes}m` : ""}
                  </span>
                  <Link
                    to="/orders/$id"
                    params={{ id: o.id }}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    {o.status === "delivered" ? "Reorder" : "Track"}{" "}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
