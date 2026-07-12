import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorSlots, type DeliverySlot } from "@/lib/store/vendor-slots-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type SlotFormValues = Omit<DeliverySlot, "id">;

const EMPTY_SLOT: SlotFormValues = { label: "", start: "", end: "", capacity: 10, cutoffTime: "" };

function SlotsTab() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { slots, addSlot, updateSlot, deleteSlot } = useVendorSlots(storeId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliverySlot | undefined>(undefined);
  const [values, setValues] = useState<SlotFormValues>(EMPTY_SLOT);
  const [pendingDelete, setPendingDelete] = useState<DeliverySlot | undefined>(undefined);

  const openAdd = () => {
    setEditing(undefined);
    setValues(EMPTY_SLOT);
    setDialogOpen(true);
  };

  const openEdit = (s: DeliverySlot) => {
    setEditing(s);
    setValues({
      label: s.label,
      start: s.start,
      end: s.end,
      capacity: s.capacity,
      cutoffTime: s.cutoffTime,
    });
    setDialogOpen(true);
  };

  const canSubmit = values.label.trim() && values.start && values.end && values.capacity > 0;

  const handleSubmit = () => {
    if (editing) updateSlot(editing.id, values);
    else addSlot(values);
    setDialogOpen(false);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="rounded-full">
          <Plus className="size-4" />
          Add slot
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{s.label}</p>
                <p className="text-sm text-muted-foreground">
                  {s.start} – {s.end}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(s)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground">Capacity</p>
                <p className="font-medium">{s.capacity} orders</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Cutoff</p>
                <p className="font-medium">{s.cutoffTime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit slot" : "Add slot"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="sl-label">Label</Label>
              <Input
                id="sl-label"
                value={values.label}
                onChange={(e) => setValues((v) => ({ ...v, label: e.target.value }))}
                placeholder="e.g. Morning"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="sl-start">Start time</Label>
                <Input
                  id="sl-start"
                  type="time"
                  value={values.start}
                  onChange={(e) => setValues((v) => ({ ...v, start: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sl-end">End time</Label>
                <Input
                  id="sl-end"
                  type="time"
                  value={values.end}
                  onChange={(e) => setValues((v) => ({ ...v, end: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="sl-capacity">Capacity</Label>
                <Input
                  id="sl-capacity"
                  type="number"
                  min={1}
                  value={values.capacity}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, capacity: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sl-cutoff">Cutoff time</Label>
                <Input
                  id="sl-cutoff"
                  value={values.cutoffTime}
                  onChange={(e) => setValues((v) => ({ ...v, cutoffTime: e.target.value }))}
                  placeholder="e.g. 9:00 PM (day before)"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit} onClick={handleSubmit}>
              {editing ? "Save changes" : "Add slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteSlot(pendingDelete.id);
                setPendingDelete(undefined);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
