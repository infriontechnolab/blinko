import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/cart-store";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorProducts } from "@/lib/store/vendor-products-store";
import { useVendorOrders } from "@/lib/store/vendor-orders-store";

export const Route = createFileRoute("/store/reports")({
  head: () => ({ meta: [{ title: `Reports — ${BRAND.name} Vendor Portal` }] }),
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <ReportsContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function ReportsContent() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { products } = useVendorProducts(storeId);
  const orders = useVendorOrders(storeId);

  const completedOrders = orders.filter(
    (o) => o.vendorStatus !== "rejected" && o.vendorStatus !== "cancelled",
  );
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalOrders = completedOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const byDay = last7Days.map((d) => {
    const key = dayKey(d);
    const dayOrders = completedOrders.filter((o) => dayKey(new Date(o.placedAt)) === key);
    return {
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.subtotal, 0),
    };
  });
  const maxRevenue = Math.max(1, ...byDay.map((d) => d.revenue));

  const unitsSold = new Map<string, number>();
  for (const o of completedOrders) {
    for (const item of o.items) {
      unitsSold.set(item.productId, (unitsSold.get(item.productId) ?? 0) + item.qty);
    }
  }
  const topProducts = [...unitsSold.entries()]
    .map(([productId, qty]) => ({ product: products.find((p) => p.id === productId), qty }))
    .filter((r) => r.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const maxQty = Math.max(1, ...topProducts.map((r) => r.qty));

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sales, inventory, and top-selling products (PRD 6.1).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-medium text-muted-foreground">Total revenue</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-medium text-muted-foreground">Total orders</p>
          <p className="mt-1 text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-medium text-muted-foreground">Average order value</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(avgOrderValue)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-4 text-sm font-bold">Sales — last 7 days</p>
        <div className="flex items-end gap-3" style={{ height: 140 }}>
          {byDay.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{
                    height: `${(d.revenue / maxRevenue) * 100}%`,
                    minHeight: d.revenue > 0 ? 4 : 0,
                  }}
                  title={`${formatPrice(d.revenue)} · ${d.count} orders`}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-bold">Top-selling products</p>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((r) => (
                <div key={r.product!.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{r.product!.name}</span>
                    <span className="shrink-0 text-muted-foreground">{r.qty} units</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(r.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-bold">Inventory levels</p>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {products.map((p) => {
              const stock = p.stockQty ?? 0;
              const pct = Math.min(100, (stock / 50) * 100);
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="shrink-0 text-muted-foreground">{stock} units</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
