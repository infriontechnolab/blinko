import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { stores, type Store } from "@/lib/mock-data";

export type StoreProfileOverride = {
  name?: string;
  logoUrl?: string;
  address?: string;
  gstNumber?: string;
  businessHours?: string;
  vacationMode?: boolean;
  /** Available Stock threshold below which Inventory flags a product as low (PRD 6.3). */
  lowStockThreshold?: number;
};

export type VendorStoreProfile = Store &
  Required<Pick<StoreProfileOverride, "lowStockThreshold">> &
  StoreProfileOverride;

type VendorStoreProfileState = Record<string, StoreProfileOverride>;

const KEY = "blinko-vendor-store-profile-v1";
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

function isVendorStoreProfileState(value: unknown): value is VendorStoreProfileState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

type VendorStoreProfileContextValue = {
  getProfile: (storeId: string) => StoreProfileOverride;
  updateProfile: (storeId: string, patch: StoreProfileOverride) => void;
};

const VendorStoreProfileContext = createContext<VendorStoreProfileContextValue | null>(null);

export function VendorStoreProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorStoreProfileState>(
    KEY,
    {},
    isVendorStoreProfileState,
  );

  const getProfile = useCallback((storeId: string) => state[storeId] ?? {}, [state]);

  const updateProfile = useCallback(
    (storeId: string, patch: StoreProfileOverride) => {
      setState((prev) => ({ ...prev, [storeId]: { ...prev[storeId], ...patch } }));
    },
    [setState],
  );

  const value = useMemo<VendorStoreProfileContextValue>(
    () => ({ getProfile, updateProfile }),
    [getProfile, updateProfile],
  );

  return (
    <VendorStoreProfileContext.Provider value={value}>
      {children}
    </VendorStoreProfileContext.Provider>
  );
}

export function useVendorStoreProfile(storeId: string) {
  const ctx = useContext(VendorStoreProfileContext);
  if (!ctx) {
    throw new Error("useVendorStoreProfile must be used within VendorStoreProfileProvider");
  }
  const base = stores.find((s) => s.id === storeId);
  const override = ctx.getProfile(storeId);

  const profile = useMemo<VendorStoreProfile | undefined>(() => {
    if (!base) return undefined;
    return {
      ...base,
      lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
      ...override,
    };
  }, [base, override]);

  return {
    profile,
    updateProfile: (patch: StoreProfileOverride) => ctx.updateProfile(storeId, patch),
  };
}
