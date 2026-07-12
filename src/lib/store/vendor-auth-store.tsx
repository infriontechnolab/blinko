import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type VendorSession = { storeId: string; loggedInAt: string };

const KEY = "blinko-vendor-session-v1";

function isVendorSession(value: unknown): value is VendorSession {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as VendorSession).storeId === "string" &&
    typeof (value as VendorSession).loggedInAt === "string"
  );
}

function isVendorSessionOrNull(value: unknown): value is VendorSession | null {
  return value === null || isVendorSession(value);
}

type VendorAuthContextValue = {
  session: VendorSession | null;
  login: (storeId: string) => void;
  logout: () => void;
};

const VendorAuthContext = createContext<VendorAuthContextValue | null>(null);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = usePersistentState<VendorSession | null>(
    KEY,
    null,
    isVendorSessionOrNull,
  );

  const login = useCallback(
    (storeId: string) => setSession({ storeId, loggedInAt: new Date().toISOString() }),
    [setSession],
  );

  const logout = useCallback(() => setSession(null), [setSession]);

  const value = useMemo<VendorAuthContextValue>(
    () => ({ session, login, logout }),
    [session, login, logout],
  );

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>;
}

export function useVendorAuth() {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) throw new Error("useVendorAuth must be used within VendorAuthProvider");
  return ctx;
}
