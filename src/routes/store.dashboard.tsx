import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Package,
  ClipboardList,
  AlertTriangle,
  Clock,
  IndianRupee,
  CalendarClock,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/cart-store";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { OrderCard } from "@/components/store/order-card";
import { Pager } from "@/components/store/pager";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorProducts } from "@/lib/store/vendor-products-store";
import { useVendorOrders, RESERVING_STATUSES } from "@/lib/store/vendor-orders-store";
import { useVendorStoreProfile } from "@/lib/store/vendor-store-profile-store";
import { useVendorSlots } from "@/lib/store/vendor-slots-store";

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
  const { slots, holidays } = useVendorSlots(storeId);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

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

  const placed = orders.filter((o) => o.vendorStatus === "placed").length;
  const inProgress = orders.filter((o) =>
    ["accepted", "preparing", "packed", "ready_for_delivery"].includes(o.vendorStatus),
  ).length;

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
    { label: "New orders", value: placed, icon: Clock, tint: "bg-accent/10 text-accent" },
    {
      label: "In progress",
      value: inProgress,
      icon: ClipboardList,
      tint: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Today's revenue",
      value: formatPrice(todaysRevenue),
      icon: IndianRupee,
      tint: "bg-primary/10 text-primary",
    },
  ];

  const isHolidayToday = holidays.includes(todayKey);

  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = orders.slice(
    (currentPage - 1) * ORDERS_PAGE_SIZE,
    currentPage * ORDERS_PAGE_SIZE,
  );

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

      <div className="mt-8">
        <h2 className="text-lg font-bold">Upcoming delivery slots</h2>
        <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
          {isHolidayToday ? (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              <CalendarClock className="size-3.5" />
              Today is marked as a holiday — no slots available.
            </p>
          ) : null}
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No delivery slots configured yet.{" "}
              <Link to="/store/slots" className="font-semibold text-primary hover:underline">
                Set some up
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.start} – {s.end}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.capacity} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Recent orders{" "}
            <span className="font-normal text-muted-foreground">({orders.length})</span>
          </h2>
          <Link to="/store/orders" className="text-sm font-semibold text-primary hover:underline">
            Manage orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageOrders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onClick={() => navigate({ to: "/store/orders", search: { order: o.id } })}
                />
              ))}
            </div>

            <Pager
              page={currentPage}
              totalPages={totalPages}
              pageSize={ORDERS_PAGE_SIZE}
              totalItems={orders.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
