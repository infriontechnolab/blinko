import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import type { Order, OrderStatus } from "./mock-data";

/**
 * Client-only order history backed by localStorage. There is no backend — a
 * placed order is a snapshot of the real basket + address, and its delivery
 * status is *derived from how long ago it was placed* so the tracker animates
 * on its own. Snapshots older than FRESH_MS are pruned on read, so demo orders
 * clean themselves up after a while.
 */

// A stored order is the durable snapshot; status/etaMinutes are computed live
// from placedAt and are never persisted.
export type StoredOrder = Omit<Order, "status" | "etaMinutes">;

const KEY = "blinko-orders-v1";
const FRESH_MS = 45 * 60_000; // keep a placed order visible for 45 minutes

// Compressed delivery timeline (ms after placedAt) so the status visibly moves
// during a demo instead of taking real-world hours. Steps advance every 10s.
const PACKED_AT = 10_000; // 0:10
const OUT_AT = 20_000; // 0:20
const DELIVERED_AT = 30_000; // 0:30

/** Derive live status + ETA from elapsed time since the order was placed. */
export function deriveStatus(
  placedAtMs: number,
  now: number,
): { status: OrderStatus; etaMinutes?: number } {
  const elapsed = now - placedAtMs;
  if (elapsed >= DELIVERED_AT) return { status: "delivered" };
  if (elapsed >= OUT_AT) {
    const etaMinutes = Math.max(1, Math.ceil((DELIVERED_AT - elapsed) / 60_000));
    return { status: "out_for_delivery", etaMinutes };
  }
  if (elapsed >= PACKED_AT) return { status: "packed" };
  return { status: "placed" };
}

/** Attach the live status to a stored snapshot, yielding a full Order. */
export function hydrateOrder(stored: StoredOrder, now: number): Order {
  return { ...stored, ...deriveStatus(new Date(stored.placedAt).getTime(), now) };
}

function isStoredOrders(value: unknown): value is StoredOrder[] {
  return (
    Array.isArray(value) &&
    value.every(
      (o): o is StoredOrder =>
        !!o &&
        typeof o === "object" &&
        typeof (o as StoredOrder).id === "string" &&
        typeof (o as StoredOrder).placedAt === "string" &&
        typeof (o as StoredOrder).total === "number" &&
        Array.isArray((o as StoredOrder).items),
    )
  );
}

type OrdersContextValue = {
  stored: StoredOrder[];
  place: (order: StoredOrder) => void;
  getStored: (id: string) => StoredOrder | undefined;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = usePersistentState<StoredOrder[]>(KEY, [], isStoredOrders);

  // Prune stale snapshots once on mount so localStorage doesn't grow forever.
  useEffect(() => {
    const cutoff = Date.now() - FRESH_MS;
    setStored((prev) => {
      const fresh = prev.filter((o) => new Date(o.placedAt).getTime() >= cutoff);
      return fresh.length === prev.length ? prev : fresh;
    });
    // Run once after hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const place = useCallback(
    (order: StoredOrder) => setStored((prev) => [order, ...prev.filter((o) => o.id !== order.id)]),
    [setStored],
  );

  const getStored = useCallback((id: string) => stored.find((o) => o.id === id), [stored]);

  const value = useMemo<OrdersContextValue>(
    () => ({ stored, place, getStored }),
    [stored, place, getStored],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

/**
 * A clock that re-renders every `intervalMs`, so time-derived status stays live.
 * Returns 0 until mounted to stay SSR-safe (server has no wall clock we can
 * trust for hydration), then ticks with the real time.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** Generate a human-friendly order id like AM-4021. */
export function newOrderId(): string {
  return `AM-${Math.floor(1000 + Math.random() * 9000)}`;
}
