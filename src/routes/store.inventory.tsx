import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/cart-store";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorProducts, isCustomProductId } from "@/lib/store/vendor-products-store";
import { useVendorOrders, RESERVING_STATUSES } from "@/lib/store/vendor-orders-store";
import { useVendorStoreProfile } from "@/lib/store/vendor-store-profile-store";
import { useVendorPurchaseEntries } from "@/lib/store/vendor-purchase-entries-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/store/inventory")({
  head: () => ({ meta: [{ title: `Inventory — ${BRAND.name} Vendor Portal` }] }),
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <InventoryContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

function InventoryContent() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Current, reserved and available stock per product, plus supplier purchase entries (PRD 6.3).
      </p>

      <Tabs defaultValue="stock" className="mt-5">
        <TabsList>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Entries</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <StockTab />
        </TabsContent>
        <TabsContent value="purchases">
          <PurchaseEntriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StockTab() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { products, updateProduct } = useVendorProducts(storeId);
  const orders = useVendorOrders(storeId);
  const { profile } = useVendorStoreProfile(storeId);
  const threshold = profile?.lowStockThreshold ?? 5;

  const reservedFor = (productId: string) =>
    orders
      .filter((o) => RESERVING_STATUSES.includes(o.vendorStatus))
      .flatMap((o) => o.items)
      .filter((it) => it.productId === productId)
      .reduce((sum, it) => sum + it.qty, 0);

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Reserved</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Alert</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            const current = p.stockQty ?? 0;
            const reserved = reservedFor(p.id);
            const available = Math.max(0, current - reserved);
            const low = available < threshold;
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.unit}</p>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={current}
                    onChange={(e) =>
                      updateProduct(
                        p.id,
                        { stockQty: Number(e.target.value) || 0 },
                        isCustomProductId(p.id),
                      )
                    }
                    className="h-8 w-24"
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{reserved}</TableCell>
                <TableCell className="text-sm font-semibold">{available}</TableCell>
                <TableCell>
                  {low ? (
                    <Badge className="gap-1 bg-destructive/10 text-destructive">
                      <AlertTriangle className="size-3" />
                      Low stock
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">OK</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function PurchaseEntriesTab() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { products, updateProduct } = useVendorProducts(storeId);
  const { entries, addEntry } = useVendorPurchaseEntries(storeId);

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [supplierName, setSupplierName] = useState("");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState("");

  const canAdd = productId && supplierName.trim() && Number(qty) > 0 && Number(unitCost) >= 0;

  const handleAdd = () => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const qtyNum = Number(qty);
    addEntry({
      productId,
      supplierName: supplierName.trim(),
      qty: qtyNum,
      unitCost: Number(unitCost),
    });
    updateProduct(
      productId,
      { stockQty: (product.stockQty ?? 0) + qtyNum },
      isCustomProductId(productId),
    );
    setSupplierName("");
    setQty("");
    setUnitCost("");
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Record a purchase
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] sm:items-end">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pe-supplier" className="text-xs text-muted-foreground">
              Supplier
            </Label>
            <Input
              id="pe-supplier"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Supplier name"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pe-qty" className="text-xs text-muted-foreground">
              Qty
            </Label>
            <Input
              id="pe-qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pe-cost" className="text-xs text-muted-foreground">
              Unit cost
            </Label>
            <Input
              id="pe-cost"
              type="number"
              min={0}
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
          </div>
          <Button disabled={!canAdd} onClick={handleAdd}>
            Add entry
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit cost</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No purchase entries yet.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => {
                const product = products.find((p) => p.id === e.productId);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm font-medium">
                      {product?.name ?? e.productId}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.supplierName}
                    </TableCell>
                    <TableCell className="text-sm">{e.qty}</TableCell>
                    <TableCell className="text-sm">{formatPrice(e.unitCost)}</TableCell>
                    <TableCell className="text-sm font-semibold">
                      {formatPrice(e.unitCost * e.qty)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(e.purchasedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
