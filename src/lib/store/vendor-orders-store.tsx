import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useOrders, type StoredOrder } from "@/lib/orders-store";
import { getProduct, pastOrders, type Order } from "@/lib/mock-data";
import { SPICE_HUB_DEMO_ORDERS } from "@/lib/store/vendor-demo-orders-seed";

/**
 * PRD 6.5 Order Management Workflow:
 * Placed -> Accepted / Rejected -> Preparing -> Packed -> Ready for Delivery -> Delivered
 * (Cancelled can happen from Placed, Accepted, or Preparing.)
 */
export type VendorOrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "preparing"
  | "packed"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled";

/** The forward progression rendered by the status stepper. Rejected/Cancelled are side-terminal. */
export const VENDOR_STATUS_SEQUENCE: VendorOrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "packed",
  "ready_for_delivery",
  "delivered",
];

/** Statuses from which a vendor may still cancel the order (PRD 9.1 rule #10). */
const CANCELLABLE_FROM: VendorOrderStatus[] = ["placed", "accepted", "preparing"];

type VendorOrderMeta = { vendorStatus: VendorOrderStatus; updatedAt: string };
type VendorOrdersState = Record<string, VendorOrderMeta>;

// v3: seeds 30 demo orders with a realistic status spread — bump the key so
// browsers with an already-persisted (unseeded) v2 map pick up the seed too.
const KEY = "blinko-vendor-order-status-v3";

function isVendorOrdersState(value: unknown): value is VendorOrdersState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// Give the 30 seeded demo orders a realistic spread of statuses on first
// load instead of defaulting every one of them to "placed".
const DEMO_STATUS_CYCLE: VendorOrderStatus[] = [
  "delivered",
  "delivered",
  "delivered",
  "ready_for_delivery",
  "packed",
  "preparing",
  "accepted",
  "placed",
  "delivered",
  "cancelled",
  "delivered",
  "rejected",
];

const SEED_STATE: VendorOrdersState = Object.fromEntries(
  SPICE_HUB_DEMO_ORDERS.map((order, i) => [
    order.id,
    {
      vendorStatus: DEMO_STATUS_CYCLE[i % DEMO_STATUS_CYCLE.length],
      updatedAt: order.placedAt,
    },
  ]),
);

type VendorOrdersContextValue = {
  getStatus: (orderId: string) => VendorOrderStatus;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  advanceStatus: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  canCancel: (status: VendorOrderStatus) => boolean;
};

const VendorOrdersContext = createContext<VendorOrdersContextValue | null>(null);

export function VendorOrdersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorOrdersState>(
    KEY,
    SEED_STATE,
    isVendorOrdersState,
  );

  const setStatus = useCallback(
    (orderId: string, vendorStatus: VendorOrderStatus) => {
      setState((prev) => ({
        ...prev,
        [orderId]: { vendorStatus, updatedAt: new Date().toISOString() },
      }));
    },
    [setState],
  );

  const getStatus = useCallback(
    (orderId: string): VendorOrderStatus => state[orderId]?.vendorStatus ?? "placed",
    [state],
  );

  const acceptOrder = useCallback((orderId: string) => setStatus(orderId, "accepted"), [setStatus]);

  const rejectOrder = useCallback((orderId: string) => setStatus(orderId, "rejected"), [setStatus]);

  const advanceStatus = useCallback(
    (orderId: string) => {
      const current = state[orderId]?.vendorStatus ?? "placed";
      const idx = VENDOR_STATUS_SEQUENCE.indexOf(current);
      const next = VENDOR_STATUS_SEQUENCE[idx + 1];
      if (next) setStatus(orderId, next);
    },
    [state, setStatus],
  );

  const cancelOrder = useCallback(
    (orderId: string) => setStatus(orderId, "cancelled"),
    [setStatus],
  );

  const canCancel = useCallback(
    (status: VendorOrderStatus) => CANCELLABLE_FROM.includes(status),
    [],
  );

  const value = useMemo<VendorOrdersContextValue>(
    () => ({ getStatus, acceptOrder, rejectOrder, advanceStatus, cancelOrder, canCancel }),
    [getStatus, acceptOrder, rejectOrder, advanceStatus, cancelOrder, canCancel],
  );

  return <VendorOrdersContext.Provider value={value}>{children}</VendorOrdersContext.Provider>;
}

export function useVendorOrdersActions() {
  const ctx = useContext(VendorOrdersContext);
  if (!ctx) throw new Error("useVendorOrdersActions must be used within VendorOrdersProvider");
  return ctx;
}

export type VendorOrderItem = { productId: string; qty: number; price: number };

export type VendorOrder = {
  id: string;
  placedAt: string;
  address: string;
  items: VendorOrderItem[];
  subtotal: number;
  vendorStatus: VendorOrderStatus;
};

/** Statuses that still hold stock in reservation (PRD 6.3 stock reservation flow). */
export const RESERVING_STATUSES: VendorOrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "packed",
  "ready_for_delivery",
];

/** All orders (live + demo history) that contain at least one item sold by `storeId`. */
export function useVendorOrders(storeId: string): VendorOrder[] {
  const { stored } = useOrders();
  const { getStatus } = useVendorOrdersActions();

  return useMemo(() => {
    const byId = new Map<string, StoredOrder | Order>();
    for (const o of pastOrders) byId.set(o.id, o);
    for (const o of SPICE_HUB_DEMO_ORDERS) byId.set(o.id, o);
    for (const o of stored) byId.set(o.id, o);

    const relevant: VendorOrder[] = [];
    for (const order of byId.values()) {
      const vendorItems = order.items.filter(
        (it) => getProduct(it.productId)?.seller_id === storeId,
      );
      if (vendorItems.length === 0) continue;
      const subtotal = vendorItems.reduce((sum, it) => sum + it.price * it.qty, 0);
      relevant.push({
        id: order.id,
        placedAt: order.placedAt,
        address: order.address,
        items: vendorItems,
        subtotal,
        vendorStatus: getStatus(order.id),
      });
    }

    return relevant.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }, [stored, storeId, getStatus]);
}
