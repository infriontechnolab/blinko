import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";

/**
 * Client-only auth check (session lives in localStorage, unreadable during
 * SSR) — mirrors the mounted-flag pattern used by usePersistentState/useNow
 * elsewhere in the app so there's no server/client mismatch on first paint.
 */
export function VendorAuthGuard({ children }: { children: ReactNode }) {
  const { session } = useVendorAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !session) {
      navigate({ to: "/store/login" });
    }
  }, [mounted, session, navigate]);

  if (!mounted || !session) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-sm text-muted-foreground">Loading vendor portal…</p>
      </div>
    );
  }

  return <>{children}</>;
}
