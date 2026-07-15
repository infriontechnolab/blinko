import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, MapPin, Clock, Phone, ArrowLeft } from "lucide-react";
import { pastOrders, getProduct, type Order } from "@/lib/mock-data";
import { formatPrice } from "@/lib/cart-store";
import { useOrders, useNow, hydrateOrder } from "@/lib/orders-store";
import { useVendorOrderStatus } from "@/lib/store/vendor-orders-store";
import { OrderTracker } from "@/components/order-tracker";
import { OrderChatBox } from "@/components/order-chat-box";
import { BRAND } from "@/lib/brand";

const search = z.object({ just_placed: z.coerce.number().optional() });

export const Route = createFileRoute("/orders/$id")({
  validateSearch: search,
  head: ({ params }) => ({
    meta: [{ title: `Order #${params.id} — ${BRAND.name}` }],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { just_placed } = Route.useSearch();
  const { getStored } = useOrders();
  const now = useNow(1000);
  const vendorStatus = useVendorOrderStatus(id);

  // Resolve a freshly placed order (client-only, live status) first, then fall
  // back to the static demo history. now === 0 means not yet mounted.
  const stored = getStored(id);
  const order: Order | undefined = stored
    ? hydrateOrder(stored, now || Date.now())
    : pastOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl font-bold">
          {now === 0 ? "Loading order…" : "Order not found"}
        </h1>
        {now !== 0 ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't find order #{id}. It may have expired.
            </p>
            <Link
              to="/orders"
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              View your orders
            </Link>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All orders
      </Link>

      {just_placed ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-heading text-lg font-bold text-primary">Order placed</p>
            <p className="mt-0.5 text-sm text-foreground/80">
              {BRAND.name} is packing your basket now. You'll see live updates below.
            </p>
          </div>
        </div>
      ) : null}

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Order · <span className="text-foreground">#{order.id}</span>
          </p>
          <h1 className="mt-1 font-heading text-4xl font-bold">
            {order.status === "delivered"
              ? "Delivered"
              : order.etaMinutes
                ? `Arriving in ${order.etaMinutes} min`
                : "On the way"}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Placed{" "}
            {new Date(order.placedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Total
          </span>
          <span className="font-mono text-3xl font-bold">{formatPrice(order.total)}</span>
        </div>
      </header>

      <section className="mt-6">
        <OrderTracker status={order.status} etaMinutes={order.etaMinutes} />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <MapPin className="size-4" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Delivering to
              </p>
              <p className="font-semibold">{order.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-border pt-3">
            <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Phone className="size-4" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Delivery partner
              </p>
              <p className="font-semibold">{BRAND.name} Rider · +1 ••• ••• 0210</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Clock className="size-4" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Timeline
              </p>
              <p className="font-semibold">Real-time updates</p>
            </div>
          </div>
          <ol className="mt-4 space-y-3 text-sm">
            <TimelineRow label="Order placed" time={clockAt(order.placedAt, 0)} done />
            <TimelineRow
              label="Packed"
              time={clockAt(order.placedAt, 1)}
              done={order.status !== "placed"}
            />
            <TimelineRow
              label="Out for delivery"
              time={order.status === "out_for_delivery" ? "Now" : clockAt(order.placedAt, 3)}
              done={order.status === "out_for_delivery" || order.status === "delivered"}
              active={order.status === "out_for_delivery"}
            />
            <TimelineRow
              label="Delivered"
              time={
                order.etaMinutes
                  ? `ETA ${order.etaMinutes}m`
                  : order.status === "delivered"
                    ? clockAt(order.placedAt, 8)
                    : "—"
              }
              done={order.status === "delivered"}
            />
          </ol>
        </section>
      </div>

      {vendorStatus === "preparing" ? (
        <div className="mt-6">
          <OrderChatBox orderId={order.id} sender="customer" title="Chat with the store" />
        </div>
      ) : null}

      <section className="mt-8 rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="font-heading text-xl font-bold">Items in this order</h2>
        </div>
        <ul className="divide-y divide-border">
          {order.items.map((it: Order["items"][number]) => {
            const p = getProduct(it.productId);
            if (!p) return null;
            return (
              <li key={it.productId} className="flex items-center gap-4 p-4">
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={p.image} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {p.unit} · {it.qty} × {formatPrice(it.price)}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold">
                  {formatPrice(it.price * it.qty)}
                </span>
              </li>
            );
          })}
        </ul>
        <dl className="space-y-2 border-t border-border p-5 text-sm">
          <Row k="Subtotal" v={formatPrice(order.subtotal)} />
          <Row k="Delivery" v={order.delivery === 0 ? "Free" : formatPrice(order.delivery)} />
          <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-heading text-base font-bold">Total paid</span>
            <span className="font-mono text-2xl font-bold">{formatPrice(order.total)}</span>
          </div>
        </dl>
      </section>
    </div>
  );
}

/** Wall-clock label `minsAfter` minutes past the placed time (e.g. "10:24 AM"). */
function clockAt(placedAt: string, minsAfter: number): string {
  return new Date(new Date(placedAt).getTime() + minsAfter * 60_000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function TimelineRow({
  label,
  time,
  done,
  active,
}: {
  label: string;
  time: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`relative grid size-4 place-items-center rounded-full ${
          done ? "bg-primary" : "bg-border"
        }`}
      >
        {active ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
        ) : null}
      </span>
      <span className={`flex-1 text-sm ${done ? "font-semibold" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {time}
      </span>
    </li>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-mono">{v}</dd>
    </div>
  );
}
