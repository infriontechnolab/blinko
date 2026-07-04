import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type CategoriesPanelValue = {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
};

const CategoriesPanelContext = createContext<CategoriesPanelValue | null>(null);

/**
 * Shared open/closed state for the home "All Categories" panel. The toggle
 * button lives in the header; the panel renders in the home route — so they
 * share state through this context. Open by default, like the reference.
 */
export function CategoriesPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const value = useMemo<CategoriesPanelValue>(
    () => ({ open, setOpen, toggle: () => setOpen((v) => !v) }),
    [open],
  );
  return <CategoriesPanelContext.Provider value={value}>{children}</CategoriesPanelContext.Provider>;
}

export function useCategoriesPanel() {
  const ctx = useContext(CategoriesPanelContext);
  if (!ctx) throw new Error("useCategoriesPanel must be used within CategoriesPanelProvider");
  return ctx;
}
