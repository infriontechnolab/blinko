import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/cart-store";
import { useVendorProductVariants } from "@/lib/store/vendor-product-variants-store";
import type { Product } from "@/lib/mock-data";

export function ProductVariantsDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}) {
  const { variants, addVariant, updateVariant, deleteVariant } = useVendorProductVariants(
    product.id,
  );
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");

  const canAdd = label.trim().length > 0 && Number(price) > 0;

  const handleAdd = () => {
    addVariant({ label: label.trim(), price: Number(price), stockQty: Number(stockQty) || 0 });
    setLabel("");
    setPrice("");
    setStockQty("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Variants — {product.name}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Set up different sizes of this product, each with its own price and stock (PRD 6.1 Product
          Variants).
        </p>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {variants.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No variants yet.
            </p>
          ) : (
            variants.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{v.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(v.price)} · {v.stockQty} in stock
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    value={v.stockQty}
                    onChange={(e) => updateVariant(v.id, { stockQty: Number(e.target.value) })}
                    className="h-8 w-20"
                    aria-label={`Stock for ${v.label}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteVariant(v.id)}
                    aria-label={`Delete ${v.label}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2 border-t border-border pt-4">
          <div className="grid gap-1.5">
            <Label htmlFor="v-label" className="text-xs text-muted-foreground">
              Label
            </Label>
            <Input
              id="v-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 500 ml"
              className="w-32"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="v-price" className="text-xs text-muted-foreground">
              Price
            </Label>
            <Input
              id="v-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="v-stock" className="text-xs text-muted-foreground">
              Stock
            </Label>
            <Input
              id="v-stock"
              type="number"
              min={0}
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="w-20"
            />
          </div>
          <Button size="icon" disabled={!canAdd} onClick={handleAdd} aria-label="Add variant">
            <Plus className="size-4" />
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
