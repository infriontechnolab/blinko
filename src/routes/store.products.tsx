import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { categories, type Product } from "@/lib/mock-data";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { VendorProductCard } from "@/components/store/vendor-product-card";
import { Pager } from "@/components/store/pager";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import {
  useVendorProducts,
  isCustomProductId,
  type ProductPatch,
} from "@/lib/store/vendor-products-store";
import { useVendorOrders, RESERVING_STATUSES } from "@/lib/store/vendor-orders-store";
import { ProductFormDialog, type ProductFormValues } from "@/components/store/product-form-dialog";
import { ProductVariantsDialog } from "@/components/store/product-variants-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/store/products")({
  head: () => ({ meta: [{ title: `Products — ${BRAND.name} Vendor Portal` }] }),
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <ProductsContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

const PRODUCTS_PAGE_SIZE = 15;

function categoryLabel(product: Product) {
  const category = categories.find((c) => c.id === product.categoryId);
  const sub = category?.subcategories.find((s) => s.id === product.subcategoryId);
  return sub ? `${category?.name} · ${sub.name}` : (category?.name ?? "—");
}

function ProductsContent() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const storeName = "Spice Hub";
  const { products, addProduct, updateProduct, deleteProduct } = useVendorProducts(storeId);
  const orders = useVendorOrders(storeId);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Product | undefined>(undefined);
  const [variantsFor, setVariantsFor] = useState<Product | undefined>(undefined);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filtered.slice(
    (currentPage - 1) * PRODUCTS_PAGE_SIZE,
    currentPage * PRODUCTS_PAGE_SIZE,
  );

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setDialogOpen(true);
  };

  // PRD 9.1 rule #6: a vendor cannot delete a product with pending orders —
  // it can only be disabled from view.
  const hasActiveOrders = (productId: string) =>
    orders.some(
      (o) =>
        RESERVING_STATUSES.includes(o.vendorStatus) &&
        o.items.some((it) => it.productId === productId),
    );

  const handleSubmit = (values: ProductFormValues) => {
    const image = values.images[0] ?? "";
    if (editing) {
      const patch: ProductPatch = { ...values, image };
      updateProduct(editing.id, patch, isCustomProductId(editing.id));
    } else {
      addProduct(
        {
          categoryId: values.categoryId,
          subcategoryId: values.subcategoryId,
          brandId: values.brandId,
          sku: values.sku || undefined,
          barcode: values.barcode || undefined,
          price: values.price,
          compareAtPrice: values.compareAtPrice,
          unit: values.unit,
          description: values.description,
          image,
          images: values.images,
          rating: 0,
          reviewCount: 0,
          inStock: values.inStock,
          enabled: values.enabled,
          stockQty: values.stockQty,
          minOrderQty: values.minOrderQty,
          maxOrderQty: values.maxOrderQty,
          name: values.name,
        },
        storeName,
      );
    }
    setDialogOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"} in your catalog.
          </p>
        </div>
        <Button onClick={openAdd} className="rounded-full">
          <Plus className="size-4" />
          Add product
        </Button>
      </div>

      <div className="relative mt-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
          No products found.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageProducts.map((p) => (
              <VendorProductCard
                key={p.id}
                product={p}
                categoryLabel={categoryLabel(p)}
                onToggleStock={(v) => updateProduct(p.id, { inStock: v }, isCustomProductId(p.id))}
                onToggleEnabled={(v) =>
                  updateProduct(p.id, { enabled: v }, isCustomProductId(p.id))
                }
                onUpdateImages={(images) =>
                  updateProduct(p.id, { images, image: images[0] ?? "" }, isCustomProductId(p.id))
                }
                onVariants={() => setVariantsFor(p)}
                onEdit={() => openEdit(p)}
                onDelete={() => setPendingDelete(p)}
              />
            ))}
          </div>

          <Pager
            page={currentPage}
            totalPages={totalPages}
            pageSize={PRODUCTS_PAGE_SIZE}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        storeId={storeId}
        otherProducts={products}
        onSubmit={handleSubmit}
      />

      {variantsFor ? (
        <ProductVariantsDialog
          open={!!variantsFor}
          onOpenChange={(open) => !open && setVariantsFor(undefined)}
          product={variantsFor}
        />
      ) : null}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && hasActiveOrders(pendingDelete.id)
                ? "This product has pending orders and can't be deleted — disable it from the card instead to hide it from customers."
                : "This removes the product from your storefront listing. This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!!pendingDelete && hasActiveOrders(pendingDelete.id)}
              onClick={() => {
                if (pendingDelete)
                  deleteProduct(pendingDelete.id, isCustomProductId(pendingDelete.id));
                setPendingDelete(undefined);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
