import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type ProductVariant = { id: string; label: string; price: number; stockQty: number };

type VendorVariantsState = Record<string, ProductVariant[]>;

const KEY = "blinko-vendor-product-variants-v1";

// Seeded example variants (PRD 6.1: "Milk in 500ml, 1L, 2L, each with its own
// price and stock") on a few of Spice Hub's existing products.
const SEED: VendorVariantsState = {
  "am-oil": [
    { id: "am-oil-500ml", label: "500 ml bottle", price: 320, stockQty: 40 },
    { id: "am-oil-1l", label: "1 L bottle", price: 580, stockQty: 60 },
    { id: "am-oil-2l", label: "2 L bottle", price: 1080, stockQty: 20 },
  ],
  "in-daawat": [
    { id: "in-daawat-1kg", label: "1 kg bag", price: 210, stockQty: 30 },
    { id: "in-daawat-5lb", label: "5 lb bag", price: 480, stockQty: 45 },
  ],
};

function isVendorVariantsState(value: unknown): value is VendorVariantsState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function newVariantId() {
  return `variant-${Math.random().toString(36).slice(2, 9)}`;
}

type VendorVariantsContextValue = {
  variantsFor: (productId: string) => ProductVariant[];
  addVariant: (productId: string, variant: Omit<ProductVariant, "id">) => void;
  updateVariant: (
    productId: string,
    variantId: string,
    patch: Partial<Omit<ProductVariant, "id">>,
  ) => void;
  deleteVariant: (productId: string, variantId: string) => void;
};

const VendorVariantsContext = createContext<VendorVariantsContextValue | null>(null);

export function VendorProductVariantsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorVariantsState>(
    KEY,
    SEED,
    isVendorVariantsState,
  );

  const variantsFor = useCallback((productId: string) => state[productId] ?? [], [state]);

  const addVariant = useCallback(
    (productId: string, variant: Omit<ProductVariant, "id">) => {
      setState((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] ?? []), { ...variant, id: newVariantId() }],
      }));
    },
    [setState],
  );

  const updateVariant = useCallback(
    (productId: string, variantId: string, patch: Partial<Omit<ProductVariant, "id">>) => {
      setState((prev) => ({
        ...prev,
        [productId]: (prev[productId] ?? []).map((v) =>
          v.id === variantId ? { ...v, ...patch } : v,
        ),
      }));
    },
    [setState],
  );

  const deleteVariant = useCallback(
    (productId: string, variantId: string) => {
      setState((prev) => ({
        ...prev,
        [productId]: (prev[productId] ?? []).filter((v) => v.id !== variantId),
      }));
    },
    [setState],
  );

  const value = useMemo<VendorVariantsContextValue>(
    () => ({ variantsFor, addVariant, updateVariant, deleteVariant }),
    [variantsFor, addVariant, updateVariant, deleteVariant],
  );

  return <VendorVariantsContext.Provider value={value}>{children}</VendorVariantsContext.Provider>;
}

export function useVendorProductVariants(productId: string) {
  const ctx = useContext(VendorVariantsContext);
  if (!ctx) {
    throw new Error("useVendorProductVariants must be used within VendorProductVariantsProvider");
  }
  return useMemo(
    () => ({
      variants: ctx.variantsFor(productId),
      addVariant: (variant: Omit<ProductVariant, "id">) => ctx.addVariant(productId, variant),
      updateVariant: (variantId: string, patch: Partial<Omit<ProductVariant, "id">>) =>
        ctx.updateVariant(productId, variantId, patch),
      deleteVariant: (variantId: string) => ctx.deleteVariant(productId, variantId),
    }),
    [ctx, productId],
  );
}
