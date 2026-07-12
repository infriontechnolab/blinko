import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ProductImageLightbox({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  title,
  onDeleteImage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
  title: string;
  onDeleteImage?: (index: number) => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  if (images.length === 0) return null;
  const current = Math.min(index, images.length - 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogTitle className="sr-only">{title} — image gallery</DialogTitle>

        <div className="relative grid aspect-square place-items-center rounded-lg bg-white">
          <img src={images[current]} alt={title} className="size-full object-contain p-6" />

          {images.length > 1 ? (
            <>
              <button
                onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-foreground shadow hover:bg-surface"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => setIndex((i) => (i + 1) % images.length)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-foreground shadow hover:bg-surface"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {current + 1} of {images.length}
          </p>
          {onDeleteImage ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDeleteImage(current)}
            >
              <Trash2 className="size-4" />
              Remove this image
            </Button>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border bg-white ${
                  i === current ? "border-primary ring-1 ring-primary" : "border-border"
                }`}
              >
                <img src={img} alt="" className="size-full object-contain p-1" />
              </button>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
