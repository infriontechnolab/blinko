import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Truck, AlertTriangle, Clock, IndianRupee } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/cart-store";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { OrderCard } from "@/components/store/order-card";
import { OrderDetailPanel } from "@/components/store/order-detail-panel";
import { Pager } from "@/components/store/pager";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorProducts } from "@/lib/store/vendor-products-store";
import { useVendorOrders, RESERVING_STATUSES } from "@/lib/store/vendor-orders-store";
import { useVendorStoreProfile } from "@/lib/store/vendor-store-profile-store";

export const Route = createFileRoute("/store/dashboard")({
  head: () => ({ meta: [{ title: `Vendor Dashboard — ${BRAND.name}` }] }),
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <DashboardContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

const ORDERS_PAGE_SIZE = 15;

function DashboardContent() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { products } = useVendorProducts(storeId);
  const orders = useVendorOrders(storeId);
  const { profile } = useVendorStoreProfile(storeId);
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  const threshold = profile?.lowStockThreshold ?? 5;
  const reservedFor = (productId: string) =>
    orders
      .filter((o) => RESERVING_STATUSES.includes(o.vendorStatus))
      .flatMap((o) => o.items)
      .filter((it) => it.productId === productId)
      .reduce((sum, it) => sum + it.qty, 0);
  const lowStockCount = products.filter(
    (p) => Math.max(0, (p.stockQty ?? 0) - reservedFor(p.id)) < threshold,
  ).length;

  const placedOrders = orders.filter((o) => o.vendorStatus === "placed");
  const readyForPickup = orders.filter((o) => o.vendorStatus === "ready_for_delivery").length;

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysRevenue = orders
    .filter(
      (o) =>
        o.placedAt.slice(0, 10) === todayKey &&
        o.vendorStatus !== "rejected" &&
        o.vendorStatus !== "cancelled",
    )
    .reduce((sum, o) => sum + o.subtotal, 0);

  const stats = [
    {
      label: "Total products",
      value: products.length,
      icon: Package,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Low stock",
      value: lowStockCount,
      icon: AlertTriangle,
      tint: "bg-destructive/10 text-destructive",
    },
    {
      label: "New orders",
      value: placedOrders.length,
      icon: Clock,
      tint: "bg-accent/10 text-accent",
    },
    {
      label: "Ready for pickup",
      value: readyForPickup,
      icon: Truck,
      tint: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Today's revenue",
      value: formatPrice(todaysRevenue),
      icon: IndianRupee,
      tint: "bg-primary/10 text-primary",
    },
  ];

  const totalPages = Math.max(1, Math.ceil(placedOrders.length / ORDERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = placedOrders.slice(
    (currentPage - 1) * ORDERS_PAGE_SIZE,
    currentPage * ORDERS_PAGE_SIZE,
  );
  const selectedOrder = placedOrders.find((o) => o.id === selectedOrderId);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A quick look at how the store is doing today.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-1 truncate text-2xl font-bold">{s.value}</p>
              </div>
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${s.tint}`}>
                <Icon className="size-5" />
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-4">
        <div className={`min-w-0 flex-1 flex-col ${selectedOrder ? "hidden md:flex" : "flex"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Recent orders{" "}
              <span className="font-normal text-muted-foreground">({placedOrders.length})</span>
            </h2>
            <Link to="/store/orders" className="text-sm font-semibold text-primary hover:underline">
              Manage orders
            </Link>
          </div>

          {placedOrders.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              No new orders right now.
            </p>
          ) : (
            <>
              <div
                className={`mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 ${selectedOrder ? "" : "lg:grid-cols-3"}`}
              >
                {pageOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    selected={selectedOrderId === o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                  />
                ))}
              </div>

              <Pager
                page={currentPage}
                totalPages={totalPages}
                pageSize={ORDERS_PAGE_SIZE}
                totalItems={placedOrders.length}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        {selectedOrder ? (
          <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrderId(undefined)} />
        ) : null}
      </div>
    </div>
  );
}
