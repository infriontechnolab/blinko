import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * State backed by localStorage, SSR-safe.
 *
 * Reads once after mount (never during SSR), then writes on every change.
 * The stored JSON is run through `validate` before adoption — corrupt or
 * hand-edited storage falls back to `initial` instead of poisoning state with
 * an arbitrary shape that would crash consumers downstream.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validate(parsed)) setValue(parsed);
      }
    } catch {
      // Unreadable/invalid storage — keep the initial value.
    }
    setHydrated(true);
    // Only re-read if the key itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — ignore.
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}
