import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Search } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { OrderCard } from "@/components/store/order-card";
import { OrderDetailPanel } from "@/components/store/order-detail-panel";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorOrders, type VendorOrderStatus } from "@/lib/store/vendor-orders-store";
import { VENDOR_STATUS_META } from "@/lib/store/vendor-order-status";
import { Input } from "@/components/ui/input";

const searchSchema = z.object({ order: z.string().optional() });

export const Route = createFileRoute("/store/orders/")({
  head: () => ({ meta: [{ title: `Orders — ${BRAND.name} Vendor Portal` }] }),
  validateSearch: searchSchema,
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <OrdersContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

const FILTERS: { key: "all" | VendorOrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "placed", label: VENDOR_STATUS_META.placed.label },
  { key: "accepted", label: VENDOR_STATUS_META.accepted.label },
  { key: "preparing", label: VENDOR_STATUS_META.preparing.label },
  { key: "ready_for_delivery", label: VENDOR_STATUS_META.ready_for_delivery.label },
];

function OrdersContent() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const orders = useVendorOrders(storeId);
  const { order: selectedId } = Route.useSearch();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<"all" | VendorOrderStatus>("placed");
  const [query, setQuery] = useState("");

  const selectOrder = (id: string | undefined) =>
    navigate({ to: "/store/orders", search: id ? { order: id } : {} });

  const needle = query.trim().toLowerCase();
  const visible = orders.filter((o) => {
    if (filter !== "all" && o.vendorStatus !== filter) return false;
    if (!needle) return true;
    return o.id.toLowerCase().includes(needle) || o.address.toLowerCase().includes(needle);
  });

  const selectedOrder = orders.find((o) => o.id === selectedId);

  return (
    <div className="flex h-full min-h-0 flex-1">
      <div
        className={`min-w-0 flex-1 flex-col overflow-hidden ${selectedOrder ? "hidden md:flex" : "flex"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 pb-4 md:p-8 md:pb-4">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders by ID or address…"
              className="rounded-full pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 px-6 pb-4 md:px-8">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? orders.length
                : orders.filter((o) => o.vendorStatus === f.key).length;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 md:px-8">
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              No orders match this filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visible.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  selected={selectedId === o.id}
                  onClick={() => selectOrder(o.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder ? (
        <OrderDetailPanel order={selectedOrder} onClose={() => selectOrder(undefined)} />
      ) : null}
    </div>
  );
}
