import { useEffect, useState } from "react";
import { Plus, X, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, type Product } from "@/lib/mock-data";
import { useVendorBrands } from "@/lib/store/vendor-brands-store";

export type ProductFormValues = {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  brandId: string;
  sku: string;
  barcode: string;
  price: number;
  compareAtPrice?: number;
  unit: string;
  description: string;
  images: string[];
  inStock: boolean;
  enabled: boolean;
  stockQty?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
};

function resolveImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
}

function emptyValues(defaultBrandId: string): ProductFormValues {
  return {
    name: "",
    categoryId: categories[0].id,
    subcategoryId: undefined,
    brandId: defaultBrandId,
    sku: "",
    barcode: "",
    price: 0,
    compareAtPrice: undefined,
    unit: "",
    description: "",
    images: [],
    inStock: true,
    enabled: false,
    stockQty: undefined,
    minOrderQty: undefined,
    maxOrderQty: undefined,
  };
}

function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    brandId: product.brandId,
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    unit: product.unit,
    description: product.description,
    images: resolveImages(product),
    inStock: product.inStock,
    enabled: product.enabled ?? true,
    stockQty: product.stockQty,
    minOrderQty: product.minOrderQty,
    maxOrderQty: product.maxOrderQty,
  };
}

type FormErrors = Partial<Record<"price" | "maxOrderQty" | "sku" | "barcode" | "enabled", string>>;

function validate(
  values: ProductFormValues,
  editingId: string | undefined,
  otherProducts: Product[],
): FormErrors {
  const errors: FormErrors = {};

  // PRD 6.2: the offer/selling Price can never be set higher than the
  // regular (compare-at) price.
  if (values.compareAtPrice != null && values.price > values.compareAtPrice) {
    errors.price = "Price can't be higher than the compare-at price.";
  }

  if (
    values.minOrderQty != null &&
    values.maxOrderQty != null &&
    values.minOrderQty > values.maxOrderQty
  ) {
    errors.maxOrderQty = "Max order qty must be greater than or equal to min order qty.";
  } else if (
    values.maxOrderQty != null &&
    values.stockQty != null &&
    values.maxOrderQty > values.stockQty
  ) {
    errors.maxOrderQty = "Max order qty can't exceed available stock.";
  }

  const sku = values.sku.trim().toLowerCase();
  if (sku && otherProducts.some((p) => p.id !== editingId && p.sku?.toLowerCase() === sku)) {
    errors.sku = "SKU must be unique in your catalog.";
  }

  const barcode = values.barcode.trim();
  if (barcode && otherProducts.some((p) => p.id !== editingId && p.barcode === barcode)) {
    errors.barcode = "Barcode must be unique in your catalog.";
  }

  // PRD 6.2: at least one photo is required before a product can go live.
  if (values.enabled && values.images.length === 0) {
    errors.enabled = "Add at least one product photo before enabling this product.";
  }

  return errors;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  storeId,
  otherProducts,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  storeId: string;
  otherProducts: Product[];
  onSubmit: (values: ProductFormValues) => void;
}) {
  const { brands } = useVendorBrands(storeId);
  const [values, setValues] = useState<ProductFormValues>(
    product ? toFormValues(product) : emptyValues(brands[0]?.id ?? ""),
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (open) {
      setValues(product ? toFormValues(product) : emptyValues(brands[0]?.id ?? ""));
      setNewImageUrl("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  const category = categories.find((c) => c.id === values.categoryId);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    set("images", [...values.images, url]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    set(
      "images",
      values.images.filter((_, i) => i !== index),
    );
  };

  const errors = validate(values, product?.id, otherProducts);
  const canSubmit =
    values.name.trim().length > 0 &&
    values.unit.trim().length > 0 &&
    values.price > 0 &&
    Object.keys(errors).length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Cold-Pressed Mustard Oil, 1 L"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={values.categoryId}
                onValueChange={(v) => {
                  set("categoryId", v);
                  set("subcategoryId", undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Subcategory</Label>
              <Select
                value={values.subcategoryId}
                onValueChange={(v) => set("subcategoryId", v)}
                disabled={!category || category.subcategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={category?.subcategories.length ? "Select" : "None"} />
                </SelectTrigger>
                <SelectContent>
                  {category?.subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Brand</Label>
            <Select value={values.brandId} onValueChange={(v) => set("brandId", v)}>
              <SelectTrigger>
                <SelectValue placeholder={brands.length ? "Select a brand" : "No brands yet"} />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {brands.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add a brand from Store Profile → Brands first.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="p-sku">SKU</Label>
              <Input
                id="p-sku"
                value={values.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="e.g. SH-OIL-001"
              />
              {errors.sku ? <p className="text-xs text-destructive">{errors.sku}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-barcode">Barcode</Label>
              <Input
                id="p-barcode"
                value={values.barcode}
                onChange={(e) => set("barcode", e.target.value)}
                placeholder="e.g. 8901030123456"
              />
              {errors.barcode ? <p className="text-xs text-destructive">{errors.barcode}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="p-price">Price (INR)</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                value={values.price || ""}
                onChange={(e) => set("price", Number(e.target.value))}
              />
              {errors.price ? <p className="text-xs text-destructive">{errors.price}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-compare">Compare-at</Label>
              <Input
                id="p-compare"
                type="number"
                min={0}
                value={values.compareAtPrice ?? ""}
                onChange={(e) =>
                  set("compareAtPrice", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-unit">Unit</Label>
              <Input
                id="p-unit"
                value={values.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="e.g. 1 L bottle"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="p-qty" className="text-xs text-muted-foreground">
                Stock qty
              </Label>
              <Input
                id="p-qty"
                type="number"
                min={0}
                value={values.stockQty ?? ""}
                onChange={(e) =>
                  set("stockQty", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-min-qty" className="text-xs text-muted-foreground">
                Min order qty
              </Label>
              <Input
                id="p-min-qty"
                type="number"
                min={0}
                value={values.minOrderQty ?? ""}
                onChange={(e) =>
                  set("minOrderQty", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-max-qty" className="text-xs text-muted-foreground">
                Max order qty
              </Label>
              <Input
                id="p-max-qty"
                type="number"
                min={0}
                value={values.maxOrderQty ?? ""}
                onChange={(e) =>
                  set("maxOrderQty", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>
          {errors.maxOrderQty ? (
            <p className="-mt-2 text-xs text-destructive">{errors.maxOrderQty}</p>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Images</Label>
            {values.images.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {values.images.map((url, i) => (
                  <div
                    key={i}
                    className="group relative grid size-16 place-items-center overflow-hidden rounded-lg border border-border bg-white"
                  >
                    <img src={url} alt="" className="size-full object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Remove image"
                      className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                <Package className="size-4" />
                No images yet — a placeholder icon will be shown instead.
              </p>
            )}
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="Image URL"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addImage}
                disabled={!newImageUrl.trim()}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Switch checked={values.inStock} onCheckedChange={(v) => set("inStock", v)} />
              <Label className="cursor-pointer">In stock</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={values.enabled} onCheckedChange={(v) => set("enabled", v)} />
              <Label className="cursor-pointer">Enabled</Label>
            </div>
          </div>
          {errors.enabled ? <p className="text-xs text-destructive">{errors.enabled}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={() => onSubmit(values)}>
            {product ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
