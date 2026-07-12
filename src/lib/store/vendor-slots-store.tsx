import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

export type DeliverySlot = {
  id: string;
  label: string;
  start: string;
  end: string;
  capacity: number;
  cutoffTime: string;
};

type VendorSlotsRecord = { slots: DeliverySlot[]; holidays: string[] };
type VendorSlotsState = Record<string, VendorSlotsRecord>;

const KEY = "blinko-vendor-slots-v1";

// Seeded with the PRD's own example slots (6.4).
const SEED: VendorSlotsState = {
  "spice-hub": {
    slots: [
      {
        id: "slot-morning",
        label: "Morning",
        start: "06:00",
        end: "08:00",
        capacity: 20,
        cutoffTime: "9:00 PM (day before)",
      },
      {
        id: "slot-afternoon",
        label: "Afternoon",
        start: "12:00",
        end: "14:00",
        capacity: 25,
        cutoffTime: "9:00 AM (same day)",
      },
      {
        id: "slot-evening",
        label: "Evening",
        start: "17:00",
        end: "19:00",
        capacity: 30,
        cutoffTime: "1:00 PM (same day)",
      },
      {
        id: "slot-night",
        label: "Night",
        start: "20:00",
        end: "22:00",
        capacity: 15,
        cutoffTime: "5:00 PM (same day)",
      },
    ],
    holidays: [],
  },
};

function isVendorSlotsState(value: unknown): value is VendorSlotsState {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function newSlotId() {
  return `slot-${Math.random().toString(36).slice(2, 9)}`;
}

type VendorSlotsContextValue = {
  recordFor: (storeId: string) => VendorSlotsRecord;
  addSlot: (storeId: string, slot: Omit<DeliverySlot, "id">) => void;
  updateSlot: (storeId: string, slotId: string, patch: Partial<Omit<DeliverySlot, "id">>) => void;
  deleteSlot: (storeId: string, slotId: string) => void;
  toggleHoliday: (storeId: string, date: string) => void;
};

const VendorSlotsContext = createContext<VendorSlotsContextValue | null>(null);

const EMPTY_RECORD: VendorSlotsRecord = { slots: [], holidays: [] };

export function VendorSlotsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<VendorSlotsState>(KEY, SEED, isVendorSlotsState);

  const recordFor = useCallback((storeId: string) => state[storeId] ?? EMPTY_RECORD, [state]);

  const addSlot = useCallback(
    (storeId: string, slot: Omit<DeliverySlot, "id">) => {
      setState((prev) => {
        const rec = prev[storeId] ?? EMPTY_RECORD;
        return {
          ...prev,
          [storeId]: { ...rec, slots: [...rec.slots, { ...slot, id: newSlotId() }] },
        };
      });
    },
    [setState],
  );

  const updateSlot = useCallback(
    (storeId: string, slotId: string, patch: Partial<Omit<DeliverySlot, "id">>) => {
      setState((prev) => {
        const rec = prev[storeId] ?? EMPTY_RECORD;
        return {
          ...prev,
          [storeId]: {
            ...rec,
            slots: rec.slots.map((s) => (s.id === slotId ? { ...s, ...patch } : s)),
          },
        };
      });
    },
    [setState],
  );

  const deleteSlot = useCallback(
    (storeId: string, slotId: string) => {
      setState((prev) => {
        const rec = prev[storeId] ?? EMPTY_RECORD;
        return { ...prev, [storeId]: { ...rec, slots: rec.slots.filter((s) => s.id !== slotId) } };
      });
    },
    [setState],
  );

  const toggleHoliday = useCallback(
    (storeId: string, date: string) => {
      setState((prev) => {
        const rec = prev[storeId] ?? EMPTY_RECORD;
        const has = rec.holidays.includes(date);
        return {
          ...prev,
          [storeId]: {
            ...rec,
            holidays: has ? rec.holidays.filter((d) => d !== date) : [...rec.holidays, date],
          },
        };
      });
    },
    [setState],
  );

  const value = useMemo<VendorSlotsContextValue>(
    () => ({ recordFor, addSlot, updateSlot, deleteSlot, toggleHoliday }),
    [recordFor, addSlot, updateSlot, deleteSlot, toggleHoliday],
  );

  return <VendorSlotsContext.Provider value={value}>{children}</VendorSlotsContext.Provider>;
}

export function useVendorSlots(storeId: string) {
  const ctx = useContext(VendorSlotsContext);
  if (!ctx) throw new Error("useVendorSlots must be used within VendorSlotsProvider");
  const rec = ctx.recordFor(storeId);
  return useMemo(
    () => ({
      slots: rec.slots,
      holidays: rec.holidays,
      addSlot: (slot: Omit<DeliverySlot, "id">) => ctx.addSlot(storeId, slot),
      updateSlot: (slotId: string, patch: Partial<Omit<DeliverySlot, "id">>) =>
        ctx.updateSlot(storeId, slotId, patch),
      deleteSlot: (slotId: string) => ctx.deleteSlot(storeId, slotId),
      toggleHoliday: (date: string) => ctx.toggleHoliday(storeId, date),
    }),
    [ctx, storeId, rec],
  );
}
