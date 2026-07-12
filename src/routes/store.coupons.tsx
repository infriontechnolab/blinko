import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/cart-store";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorCoupons, type Coupon } from "@/lib/store/vendor-coupons-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const Route = createFileRoute("/store/coupons")({
  head: () => ({ meta: [{ title: `Coupons — ${BRAND.name} Vendor Portal` }] }),
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <CouponsContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

type CouponFormValues = Omit<Coupon, "id">;

function emptyCoupon(): CouponFormValues {
  return {
    code: "",
    type: "percent",
    value: 0,
    minOrderValue: 0,
    expiresAt: "",
    usageLimit: 100,
    stackable: false,
    active: true,
  };
}

function toFormValues(c: Coupon): CouponFormValues {
  return {
    code: c.code,
    type: c.type,
    value: c.value,
    minOrderValue: c.minOrderValue,
    expiresAt: c.expiresAt.slice(0, 10),
    usageLimit: c.usageLimit,
    stackable: c.stackable,
    active: c.active,
  };
}

function CouponsContent() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useVendorCoupons(storeId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | undefined>(undefined);
  const [values, setValues] = useState<CouponFormValues>(emptyCoupon());
  const [pendingDelete, setPendingDelete] = useState<Coupon | undefined>(undefined);

  useEffect(() => {
    if (dialogOpen) setValues(editing ? toFormValues(editing) : emptyCoupon());
  }, [dialogOpen, editing]);

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const canSubmit = values.code.trim().length > 0 && values.value > 0 && values.expiresAt;

  const handleSubmit = () => {
    const payload: CouponFormValues = {
      ...values,
      code: values.code.trim().toUpperCase(),
      expiresAt: new Date(`${values.expiresAt}T23:59:00`).toISOString(),
    };
    if (editing) updateCoupon(editing.id, payload);
    else addCoupon(payload);
    setDialogOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Coupons &amp; Offers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discount codes for your own shop (PRD 6.1).
          </p>
        </div>
        <Button onClick={openAdd} className="rounded-full">
          <Plus className="size-4" />
          Add coupon
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min order</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Usage limit</TableHead>
              <TableHead>Stackable</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm font-semibold">{c.code}</TableCell>
                  <TableCell className="text-sm">
                    {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatPrice(c.minOrderValue)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(c.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.usageLimit}</TableCell>
                  <TableCell>
                    {c.stackable ? (
                      <Badge variant="secondary">Stackable</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.active}
                      onCheckedChange={(v) => updateCoupon(c.id, { active: v })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setPendingDelete(c)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit coupon" : "Add coupon"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="c-code">Code</Label>
              <Input
                id="c-code"
                value={values.code}
                onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
                placeholder="e.g. SPICE10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select
                  value={values.type}
                  onValueChange={(t) => setValues((v) => ({ ...v, type: t as Coupon["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent off</SelectItem>
                    <SelectItem value="flat">Flat amount off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="c-value">Value</Label>
                <Input
                  id="c-value"
                  type="number"
                  min={0}
                  value={values.value}
                  onChange={(e) => setValues((v) => ({ ...v, value: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="c-min">Min order value</Label>
                <Input
                  id="c-min"
                  type="number"
                  min={0}
                  value={values.minOrderValue}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, minOrderValue: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="c-expiry">Expires on</Label>
                <Input
                  id="c-expiry"
                  type="date"
                  value={values.expiresAt}
                  onChange={(e) => setValues((v) => ({ ...v, expiresAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-usage">Usage limit</Label>
              <Input
                id="c-usage"
                type="number"
                min={1}
                value={values.usageLimit}
                onChange={(e) =>
                  setValues((v) => ({ ...v, usageLimit: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label className="cursor-pointer">Stackable with other coupons</Label>
              <Switch
                checked={values.stackable}
                onCheckedChange={(v) => setValues((val) => ({ ...val, stackable: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit} onClick={handleSubmit}>
              {editing ? "Save changes" : "Add coupon"}
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
            <AlertDialogTitle>Delete "{pendingDelete?.code}"?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteCoupon(pendingDelete.id);
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
