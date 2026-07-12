import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type VendorBrand = { id: string; name: string };

type VendorBrandsState = Record<string, VendorBrand[]>;

const KEY = "blinko-vendor-brands-v1";

// Seeded so the Brands tab (and the product form's Brand picker) isn't empty
// on first load — PRD 6.1 "Category / Subcategory / Brand" module.
const SEED: VendorBrandsState = {
  "spice-hub": [
    { id: "spice-hub-own", name: "Spice Hub Own" },
    { id: "premium-select", name: "Premium Select" },
  ],
};

function isVendorBrandsState(value: unknown): value is VendorBrandsState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function newBrandId() {
  return `brand-${Math.random().toString(36).slice(2, 9)}`;
}

type VendorBrandsContextValue = {
  brandsFor: (storeId: string) => VendorBrand[];
  addBrand: (storeId: string, name: string) => void;
  renameBrand: (storeId: string, brandId: string, name: string) => void;
  deleteBrand: (storeId: string, brandId: string) => void;
};

const VendorBrandsContext = createContext<VendorBrandsContextValue | null>(null);

export function VendorBrandsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorBrandsState>(KEY, SEED, isVendorBrandsState);

  const brandsFor = useCallback((storeId: string) => state[storeId] ?? [], [state]);

  const addBrand = useCallback(
    (storeId: string, name: string) => {
      setState((prev) => ({
        ...prev,
        [storeId]: [...(prev[storeId] ?? []), { id: newBrandId(), name }],
      }));
    },
    [setState],
  );

  const renameBrand = useCallback(
    (storeId: string, brandId: string, name: string) => {
      setState((prev) => ({
        ...prev,
        [storeId]: (prev[storeId] ?? []).map((b) => (b.id === brandId ? { ...b, name } : b)),
      }));
    },
    [setState],
  );

  const deleteBrand = useCallback(
    (storeId: string, brandId: string) => {
      setState((prev) => ({
        ...prev,
        [storeId]: (prev[storeId] ?? []).filter((b) => b.id !== brandId),
      }));
    },
    [setState],
  );

  const value = useMemo<VendorBrandsContextValue>(
    () => ({ brandsFor, addBrand, renameBrand, deleteBrand }),
    [brandsFor, addBrand, renameBrand, deleteBrand],
  );

  return <VendorBrandsContext.Provider value={value}>{children}</VendorBrandsContext.Provider>;
}

export function useVendorBrands(storeId: string) {
  const ctx = useContext(VendorBrandsContext);
  if (!ctx) throw new Error("useVendorBrands must be used within VendorBrandsProvider");
  return useMemo(
    () => ({
      brands: ctx.brandsFor(storeId),
      addBrand: (name: string) => ctx.addBrand(storeId, name),
      renameBrand: (brandId: string, name: string) => ctx.renameBrand(storeId, brandId, name),
      deleteBrand: (brandId: string) => ctx.deleteBrand(storeId, brandId),
    }),
    [ctx, storeId],
  );
}
