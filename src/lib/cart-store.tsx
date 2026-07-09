import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { getProduct } from "./mock-data";
import { CURRENCY } from "./brand";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type CartItem = { productId: string; qty: number };

function isCartItems(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item): item is CartItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as CartItem).productId === "string" &&
        typeof (item as CartItem).qty === "number",
    )
  );
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const KEY = "blinko-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = usePersistentState<CartItem[]>(KEY, [], isCartItems);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const add = useCallback((productId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const it of items) {
      const p = getProduct(it.productId);
      if (!p) continue;
      c += it.qty;
      s += p.price * it.qty;
    }
    return { count: c, subtotal: s };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, count, subtotal, add, remove, setQty, clear, drawerOpen, setDrawerOpen }),
    [items, count, subtotal, add, remove, setQty, clear, drawerOpen, setDrawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatPrice(n: number) {
  return `${CURRENCY.symbol}${(n * CURRENCY.inrRate).toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
