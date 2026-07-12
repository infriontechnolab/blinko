import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { productsByStore, type Product } from "@/lib/mock-data";
import { SPICE_HUB_DEMO_PRODUCTS } from "@/lib/store/vendor-demo-products-seed";

export type ProductPatch = Partial<Omit<Product, "id" | "seller_id">> & { deleted?: boolean };

type VendorProductsState = {
  overrides: Record<string, ProductPatch>;
  custom: Product[];
};

// v4: expands multi-image galleries to 10 of the real catalog products so
// the gallery/thumbnail UI is visible across most of the actual listing.
const KEY = "blinko-vendor-products-v4";

function isVendorProductsState(value: unknown): value is VendorProductsState {
  if (!value || typeof value !== "object") return false;
  const v = value as VendorProductsState;
  return (
    !!v.overrides &&
    typeof v.overrides === "object" &&
    !Array.isArray(v.overrides) &&
    Array.isArray(v.custom)
  );
}

const SEED_STOCK: VendorProductsState = {
  overrides: {
    "am-oil": {
      stockQty: 60,
      images: [
        "/product-images/ing-olive-oil.png",
        "/product-images/ing-honey.png",
        "/product-images/ing-butter.png",
      ],
    },
    "in-daawat": {
      stockQty: 45,
      images: ["/product-images/ing-basmati-rice.png", "/product-images/ing-red-lentils.png"],
    },
    "in-vadilal": { stockQty: 30 },
    "in-rusk": {
      stockQty: 70,
      images: [
        "/product-images/ing-bread.png",
        "/product-images/ing-oats.png",
        "/product-images/ing-honey.png",
      ],
    },
    "in-goodday": {
      stockQty: 55,
      images: ["/product-images/ing-butter.png", "/product-images/ing-honey.png"],
    },
    "ca-shana-paratha": {
      stockQty: 25,
      images: [
        "/product-images/ca-shana-paratha.jpg",
        "/product-images/ing-butter.png",
        "/product-images/ing-bread.png",
      ],
    },
    "ca-verka-rusk": {
      stockQty: 40,
      images: ["/product-images/ca-verka-rusk.jpg", "/product-images/ing-milk.png"],
    },
    "ca-golden-temple-atta": {
      stockQty: 20,
      images: [
        "/product-images/ca-golden-temple-atta.jpg",
        "/product-images/ing-oats.png",
        "/product-images/ing-red-lentils.png",
        "/product-images/ing-honey.png",
      ],
    },
    "ca-haldirams-boondi": {
      stockQty: 65,
      images: [
        "/product-images/ca-haldirams-boondi.jpg",
        "/product-images/ing-oats.png",
        "/product-images/ing-honey.png",
      ],
    },
    "ca-aashirvaad-atta": {
      stockQty: 18,
      images: [
        "/product-images/ca-aashirvaad-atta.jpg",
        "/product-images/ing-basmati-rice.png",
        "/product-images/ing-oats.png",
      ],
    },
    "ca-nanak-kebab": {
      stockQty: 35,
      images: [
        "/product-images/ca-nanak-kebab.jpg",
        "/product-images/ing-spinach.png",
        "/product-images/ing-potatoes.png",
      ],
    },
  },
  custom: SPICE_HUB_DEMO_PRODUCTS,
};

function newProductId() {
  return `vp-${Math.random().toString(36).slice(2, 10)}`;
}

type VendorProductsContextValue = {
  addProduct: (
    storeId: string,
    storeName: string,
    product: Omit<Product, "id" | "seller_id" | "store_name">,
  ) => void;
  updateProduct: (id: string, patch: ProductPatch, isCustom: boolean) => void;
  deleteProduct: (id: string, isCustom: boolean) => void;
  productsFor: (storeId: string) => Product[];
};

const VendorProductsContext = createContext<VendorProductsContextValue | null>(null);

export function VendorProductsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorProductsState>(
    KEY,
    SEED_STOCK,
    isVendorProductsState,
  );

  const addProduct = useCallback(
    (
      storeId: string,
      storeName: string,
      product: Omit<Product, "id" | "seller_id" | "store_name">,
    ) => {
      const newProduct: Product = {
        ...product,
        id: newProductId(),
        seller_id: storeId,
        store_name: storeName,
      };
      setState((prev) => ({ ...prev, custom: [newProduct, ...prev.custom] }));
    },
    [setState],
  );

  const updateProduct = useCallback(
    (id: string, patch: ProductPatch, isCustom: boolean) => {
      setState((prev) => {
        if (isCustom) {
          return {
            ...prev,
            custom: prev.custom.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          };
        }
        return {
          ...prev,
          overrides: { ...prev.overrides, [id]: { ...prev.overrides[id], ...patch } },
        };
      });
    },
    [setState],
  );

  const deleteProduct = useCallback(
    (id: string, isCustom: boolean) => {
      setState((prev) => {
        if (isCustom) {
          return { ...prev, custom: prev.custom.filter((p) => p.id !== id) };
        }
        return {
          ...prev,
          overrides: { ...prev.overrides, [id]: { ...prev.overrides[id], deleted: true } },
        };
      });
    },
    [setState],
  );

  const productsFor = useCallback(
    (storeId: string) => {
      const base = productsByStore(storeId)
        .map((p) => {
          const patch = state.overrides[p.id];
          return patch ? { ...p, ...patch } : p;
        })
        .filter((p) => !state.overrides[p.id]?.deleted);
      const customForStore = state.custom.filter((p) => p.seller_id === storeId);
      // Real catalog products first, added/demo products after — so a
      // vendor's actual listing isn't buried behind seeded filler on page 1.
      return [...base, ...customForStore];
    },
    [state],
  );

  const value = useMemo<VendorProductsContextValue>(
    () => ({ addProduct, updateProduct, deleteProduct, productsFor }),
    [addProduct, updateProduct, deleteProduct, productsFor],
  );

  return <VendorProductsContext.Provider value={value}>{children}</VendorProductsContext.Provider>;
}

export function useVendorProducts(storeId: string) {
  const ctx = useContext(VendorProductsContext);
  if (!ctx) throw new Error("useVendorProducts must be used within VendorProductsProvider");
  return useMemo(
    () => ({
      products: ctx.productsFor(storeId),
      addProduct: (product: Omit<Product, "id" | "seller_id" | "store_name">, storeName: string) =>
        ctx.addProduct(storeId, storeName, product),
      updateProduct: ctx.updateProduct,
      deleteProduct: ctx.deleteProduct,
    }),
    [ctx, storeId],
  );
}

/** A product is "custom" (vendor-added) rather than a base-catalog override if its id has our prefix. */
export function isCustomProductId(id: string) {
  return id.startsWith("vp-");
}
