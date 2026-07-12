import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderValue: number;
  expiresAt: string;
  usageLimit: number;
  stackable: boolean;
  active: boolean;
};

type VendorCouponsState = Record<string, Coupon[]>;

const KEY = "blinko-vendor-coupons-v1";

const SEED: VendorCouponsState = {
  "spice-hub": [
    {
      id: "coupon-seed-1",
      code: "SPICE10",
      type: "percent",
      value: 10,
      minOrderValue: 300,
      expiresAt: "2026-12-31T23:59:00Z",
      usageLimit: 500,
      stackable: false,
      active: true,
    },
    {
      id: "coupon-seed-2",
      code: "WELCOME50",
      type: "flat",
      value: 50,
      minOrderValue: 200,
      expiresAt: "2026-09-30T23:59:00Z",
      usageLimit: 100,
      stackable: false,
      active: true,
    },
  ],
};

function isVendorCouponsState(value: unknown): value is VendorCouponsState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function newCouponId() {
  return `coupon-${Math.random().toString(36).slice(2, 9)}`;
}

type VendorCouponsContextValue = {
  couponsFor: (storeId: string) => Coupon[];
  addCoupon: (storeId: string, coupon: Omit<Coupon, "id">) => void;
  updateCoupon: (storeId: string, couponId: string, patch: Partial<Omit<Coupon, "id">>) => void;
  deleteCoupon: (storeId: string, couponId: string) => void;
};

const VendorCouponsContext = createContext<VendorCouponsContextValue | null>(null);

export function VendorCouponsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorCouponsState>(KEY, SEED, isVendorCouponsState);

  const couponsFor = useCallback((storeId: string) => state[storeId] ?? [], [state]);

  const addCoupon = useCallback(
    (storeId: string, coupon: Omit<Coupon, "id">) => {
      setState((prev) => ({
        ...prev,
        [storeId]: [...(prev[storeId] ?? []), { ...coupon, id: newCouponId() }],
      }));
    },
    [setState],
  );

  const updateCoupon = useCallback(
    (storeId: string, couponId: string, patch: Partial<Omit<Coupon, "id">>) => {
      setState((prev) => ({
        ...prev,
        [storeId]: (prev[storeId] ?? []).map((c) => (c.id === couponId ? { ...c, ...patch } : c)),
      }));
    },
    [setState],
  );

  const deleteCoupon = useCallback(
    (storeId: string, couponId: string) => {
      setState((prev) => ({
        ...prev,
        [storeId]: (prev[storeId] ?? []).filter((c) => c.id !== couponId),
      }));
    },
    [setState],
  );

  const value = useMemo<VendorCouponsContextValue>(
    () => ({ couponsFor, addCoupon, updateCoupon, deleteCoupon }),
    [couponsFor, addCoupon, updateCoupon, deleteCoupon],
  );

  return <VendorCouponsContext.Provider value={value}>{children}</VendorCouponsContext.Provider>;
}

export function useVendorCoupons(storeId: string) {
  const ctx = useContext(VendorCouponsContext);
  if (!ctx) throw new Error("useVendorCoupons must be used within VendorCouponsProvider");
  return useMemo(
    () => ({
      coupons: ctx.couponsFor(storeId),
      addCoupon: (coupon: Omit<Coupon, "id">) => ctx.addCoupon(storeId, coupon),
      updateCoupon: (couponId: string, patch: Partial<Omit<Coupon, "id">>) =>
        ctx.updateCoupon(storeId, couponId, patch),
      deleteCoupon: (couponId: string) => ctx.deleteCoupon(storeId, couponId),
    }),
    [ctx, storeId],
  );
}
