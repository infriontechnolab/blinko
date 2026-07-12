import { Package } from "lucide-react";
import { formatPrice } from "@/lib/cart-store";
import { StatusPill } from "@/components/store/status-pill";
import type { VendorOrder } from "@/lib/store/vendor-orders-store";

export function OrderCard({
  order,
  selected,
  onClick,
}: {
  order: VendorOrder;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border bg-surface p-4 text-left transition-colors hover:border-primary/30 ${
        selected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-sm font-bold">#{order.id}</span>
        <StatusPill status={order.vendorStatus} />
      </div>

      <div className="mt-3 space-y-2 pr-14">
        <div>
          <p className="text-[11px] text-muted-foreground">Delivery address</p>
          <p className="truncate text-sm font-medium">{order.address}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Placed</p>
          <p className="text-sm font-medium">
            {new Date(order.placedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Items</p>
          <p className="text-sm font-medium">
            {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
            {formatPrice(order.subtotal)}
          </p>
        </div>
      </div>

      <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Package className="size-5" />
      </span>
    </button>
  );
}
