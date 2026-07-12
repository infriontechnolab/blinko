import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type PurchaseEntry = {
  id: string;
  productId: string;
  supplierName: string;
  qty: number;
  unitCost: number;
  purchasedAt: string;
};

type VendorPurchaseEntriesState = Record<string, PurchaseEntry[]>;

const KEY = "blinko-vendor-purchase-entries-v1";

// Seeded example entries (PRD 6.1 "Purchase Entry" module).
const SEED: VendorPurchaseEntriesState = {
  "spice-hub": [
    {
      id: "pe-seed-1",
      productId: "am-oil",
      supplierName: "Millhouse Distributors",
      qty: 50,
      unitCost: 410,
      purchasedAt: "2026-06-20T09:00:00Z",
    },
    {
      id: "pe-seed-2",
      productId: "ca-golden-temple-atta",
      supplierName: "Golden Temple Wholesale",
      qty: 25,
      unitCost: 1320,
      purchasedAt: "2026-06-24T09:00:00Z",
    },
  ],
};

function isVendorPurchaseEntriesState(value: unknown): value is VendorPurchaseEntriesState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function newEntryId() {
  return `pe-${Math.random().toString(36).slice(2, 9)}`;
}

type VendorPurchaseEntriesContextValue = {
  entriesFor: (storeId: string) => PurchaseEntry[];
  addEntry: (storeId: string, entry: Omit<PurchaseEntry, "id" | "purchasedAt">) => void;
};

const VendorPurchaseEntriesContext = createContext<VendorPurchaseEntriesContextValue | null>(null);

export function VendorPurchaseEntriesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorPurchaseEntriesState>(
    KEY,
    SEED,
    isVendorPurchaseEntriesState,
  );

  const entriesFor = useCallback(
    (storeId: string) =>
      [...(state[storeId] ?? [])].sort(
        (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
      ),
    [state],
  );

  const addEntry = useCallback(
    (storeId: string, entry: Omit<PurchaseEntry, "id" | "purchasedAt">) => {
      setState((prev) => ({
        ...prev,
        [storeId]: [
          { ...entry, id: newEntryId(), purchasedAt: new Date().toISOString() },
          ...(prev[storeId] ?? []),
        ],
      }));
    },
    [setState],
  );

  const value = useMemo<VendorPurchaseEntriesContextValue>(
    () => ({ entriesFor, addEntry }),
    [entriesFor, addEntry],
  );

  return (
    <VendorPurchaseEntriesContext.Provider value={value}>
      {children}
    </VendorPurchaseEntriesContext.Provider>
  );
}

export function useVendorPurchaseEntries(storeId: string) {
  const ctx = useContext(VendorPurchaseEntriesContext);
  if (!ctx) {
    throw new Error("useVendorPurchaseEntries must be used within VendorPurchaseEntriesProvider");
  }
  return useMemo(
    () => ({
      entries: ctx.entriesFor(storeId),
      addEntry: (entry: Omit<PurchaseEntry, "id" | "purchasedAt">) => ctx.addEntry(storeId, entry),
    }),
    [ctx, storeId],
  );
}
