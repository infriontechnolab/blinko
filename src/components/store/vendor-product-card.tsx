import { useState } from "react";
import { Pencil, Trash2, Layers, Package } from "lucide-react";
import { formatPrice } from "@/lib/cart-store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImageLightbox } from "@/components/store/product-image-lightbox";
import type { Product } from "@/lib/mock-data";

const VISIBLE_THUMBS = 2;

function resolveImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
}

export function VendorProductCard({
  product,
  categoryLabel,
  onToggleStock,
  onToggleEnabled,
  onUpdateImages,
  onVariants,
  onEdit,
  onDelete,
}: {
  product: Product;
  categoryLabel: string;
  onToggleStock: (checked: boolean) => void;
  onToggleEnabled: (checked: boolean) => void;
  onUpdateImages: (images: string[]) => void;
  onVariants: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const enabled = product.enabled ?? true;
  const images = resolveImages(product);
  const extraThumbs = images.slice(1, 1 + VISIBLE_THUMBS);
  const remainingCount = images.length - 1 - VISIBLE_THUMBS;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDeleteImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onUpdateImages(next);
    if (next.length === 0) setLightboxOpen(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => images.length > 0 && openLightbox(0)}
          className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white"
          aria-label={`View ${product.name} image`}
        >
          {images[0] ? (
            <img src={images[0]} alt="" className="size-full object-contain p-2" />
          ) : (
            <Package className="size-8 text-muted-foreground" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.unit}</p>
          <p className="mt-1 text-xs text-muted-foreground">{categoryLabel}</p>

          {extraThumbs.length > 0 ? (
            <div className="mt-2 flex gap-1.5">
              {extraThumbs.map((img, i) => {
                const isLastThumb = i === extraThumbs.length - 1;
                const showOverlay = isLastThumb && remainingCount > 0;
                return (
                  <button
                    key={i}
                    onClick={() => openLightbox(i + 1)}
                    className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-white"
                    aria-label={`View more images of ${product.name}`}
                  >
                    <img src={img} alt="" className="size-full object-contain p-1" />
                    {showOverlay ? (
                      <span className="absolute inset-0 grid place-items-center bg-black/55 text-[10px] font-semibold text-white">
                        +{remainingCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {!enabled ? (
          <Badge variant="outline" className="shrink-0 text-muted-foreground">
            Disabled
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-mono text-xs text-muted-foreground">SKU {product.sku ?? "—"}</span>
        <span className="text-base font-bold">{formatPrice(product.price)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Switch checked={product.inStock} onCheckedChange={onToggleStock} />
          <span className="text-xs text-muted-foreground">
            {product.stockQty != null
              ? `${product.stockQty} units`
              : product.inStock
                ? "In stock"
                : "Out"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={enabled} onCheckedChange={onToggleEnabled} />
          <span className="text-xs text-muted-foreground">Enabled</span>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onVariants}
          aria-label={`Variants for ${product.name}`}
        >
          <Layers className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${product.name}`}>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      <ProductImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={images}
        initialIndex={lightboxIndex}
        title={product.name}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}
