import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { useVendorStoreProfile } from "@/lib/store/vendor-store-profile-store";
import { useVendorBrands } from "@/lib/store/vendor-brands-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/store/profile")({
  head: () => ({ meta: [{ title: `Store Profile — ${BRAND.name} Vendor Portal` }] }),
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <ProfileContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

function ProfileContent() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <h1 className="text-2xl font-bold">Store Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Shop details, business hours, and your catalog's brand list (PRD 6.1).
      </p>

      <Tabs defaultValue="profile" className="mt-5">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="brands">
          <BrandsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileForm() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { profile, updateProfile } = useVendorStoreProfile(storeId);

  const [name, setName] = useState(profile?.name ?? "");
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [gstNumber, setGstNumber] = useState(profile?.gstNumber ?? "");
  const [businessHours, setBusinessHours] = useState(profile?.businessHours ?? "");
  const [vacationMode, setVacationMode] = useState(profile?.vacationMode ?? false);
  const [lowStockThreshold, setLowStockThreshold] = useState(profile?.lowStockThreshold ?? 5);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setLogoUrl(profile.logoUrl ?? "");
    setAddress(profile.address);
    setGstNumber(profile.gstNumber ?? "");
    setBusinessHours(profile.businessHours ?? "");
    setVacationMode(profile.vacationMode ?? false);
    setLowStockThreshold(profile.lowStockThreshold);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) return null;

  const handleSave = () => {
    updateProfile({
      name,
      logoUrl: logoUrl || undefined,
      address,
      gstNumber: gstNumber || undefined,
      businessHours: businessHours || undefined,
      vacationMode,
      lowStockThreshold,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="s-name">Shop name</Label>
          <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="s-logo">Logo URL</Label>
          <Input
            id="s-logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="Leave blank to keep the current logo"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-1.5">
        <Label htmlFor="s-address">Address</Label>
        <Textarea
          id="s-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="s-gst">GST number</Label>
          <Input
            id="s-gst"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            placeholder="e.g. 27ABCDE1234F1Z5"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="s-hours">Business hours</Label>
          <Input
            id="s-hours"
            value={businessHours}
            onChange={(e) => setBusinessHours(e.target.value)}
            placeholder="e.g. 8:00 AM – 10:00 PM, all days"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-1.5 sm:w-48">
        <Label htmlFor="s-threshold">Low stock alert threshold</Label>
        <Input
          id="s-threshold"
          type="number"
          min={0}
          value={lowStockThreshold}
          onChange={(e) => setLowStockThreshold(Number(e.target.value) || 0)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-semibold">Vacation Mode</p>
          <p className="text-xs text-muted-foreground">
            Pause the store temporarily. Vendor-side only in this demo — it does not affect the live
            customer storefront.
          </p>
        </div>
        <Switch checked={vacationMode} onCheckedChange={setVacationMode} />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleSave} className="rounded-full">
          Save changes
        </Button>
        {saved ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
            <Check className="size-4" /> Saved
          </span>
        ) : null}
      </div>
    </div>
  );
}

function BrandsList() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const { brands, addBrand, renameBrand, deleteBrand } = useVendorBrands(storeId);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    addBrand(newName.trim());
    setNewName("");
  };

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New brand name"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!newName.trim()}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="mt-4 divide-y divide-border">
        {brands.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No brands yet.</p>
        ) : (
          brands.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 py-2.5">
              {editingId === b.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (editingName.trim()) renameBrand(b.id, editingName.trim());
                        setEditingId(undefined);
                      }}
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(undefined)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">{b.name}</span>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(b.id);
                        setEditingName(b.name);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteBrand(b.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
