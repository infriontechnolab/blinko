import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorSlots } from "@/lib/store/vendor-slots-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export const Route = createFileRoute("/store/slots")({
  head: () => ({ meta: [{ title: `Delivery Slots — ${BRAND.name} Vendor Portal` }] }),
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <SlotsContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

function SlotsContent() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <h1 className="text-2xl font-bold">Delivery Slots</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Time windows, capacity and cutoff times customers can choose at checkout, plus blocked
        holiday dates (PRD 6.4).
      </p>

      <Tabs defaultValue="slots" className="mt-5">
        <TabsList>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>
        <TabsContent value="slots">
          <SlotsTab />
        </TabsContent>
        <TabsContent value="holidays">
          <HolidaysTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SlotsTab() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { slots } = useVendorSlots(storeId);

  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground">
        Delivery slots are set by the {BRAND.name} admin team and can't be added or edited from the
        store side.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {slots.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-semibold">{s.label}</p>
            <p className="text-sm text-muted-foreground">
              {s.start} – {s.end}
            </p>
            <div className="mt-3 text-sm">
              <p className="text-[11px] text-muted-foreground">Cutoff</p>
              <p className="font-medium">{s.cutoffTime}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function HolidaysTab() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { holidays, toggleHoliday } = useVendorSlots(storeId);

  const selectedDates = holidays.map((d) => new Date(`${d}T00:00:00`));

  const handleSelect = (dates: Date[] | undefined) => {
    const next = new Set((dates ?? []).map(toDateKey));
    const prev = new Set(holidays);
    for (const d of next) if (!prev.has(d)) toggleHoliday(d);
    for (const d of prev) if (!next.has(d)) toggleHoliday(d);
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={handleSelect}
          className="mx-auto"
        />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Blocked dates
        </p>
        {holidays.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No holidays set. Pick dates on the calendar to block all delivery slots that day.
          </p>
        ) : (
          <div className="space-y-2">
            {[...holidays].sort().map((d) => (
              <div
                key={d}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm font-medium">
                  {new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Button variant="ghost" size="icon" onClick={() => toggleHoliday(d)}>
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
