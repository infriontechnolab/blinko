import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Store as StoreIcon } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { stores } from "@/lib/mock-data";
import { storeLogoUrl } from "@/components/store-card";
import { VendorProviders } from "@/components/store/vendor-providers";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/store/login")({
  head: () => ({ meta: [{ title: `Vendor Login — ${BRAND.name}` }] }),
  component: () => (
    <VendorProviders>
      <VendorLoginPage />
    </VendorProviders>
  ),
});

const DEMO_STORE_ID = "spice-hub";
const DEMO_EMAIL = "vendor@spicehub.com";
const DEMO_PASSWORD = "demo123";

function VendorLoginPage() {
  const store = stores.find((s) => s.id === DEMO_STORE_ID)!;
  const { login } = useVendorAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      login(DEMO_STORE_ID);
      navigate({ to: "/store/dashboard" });
    } else {
      setError("Incorrect email or password.");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img
            src={BRAND.icon}
            alt={`${BRAND.name} logo`}
            className="size-12 shrink-0 rounded-xl object-contain"
          />
          <span className="mt-2 text-xl font-extrabold leading-none tracking-tight">
            <span className="text-foreground">{BRAND.wordmarkPrefix}</span>
            <span className="text-primary">{BRAND.wordmarkSuffix}</span>
          </span>

          <div className="my-5 h-px w-full bg-border" />

          <div className="grid size-14 shrink-0 place-items-center rounded-xl border border-border bg-white p-2">
            <img
              src={storeLogoUrl(store)}
              alt={`${store.name} logo`}
              className="size-full object-contain"
            />
          </div>
          <h1 className="mt-3 font-heading text-xl font-bold">{store.name}</h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <StoreIcon className="size-3.5" />
            Vendor Portal
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="v-email">Email</Label>
            <Input
              id="v-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={DEMO_EMAIL}
              autoComplete="username"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="v-password">Password</Label>
            <Input
              id="v-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="mt-1 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Log in
          </Button>
        </form>

        <p className="mt-5 rounded-lg bg-muted/60 px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          Demo credentials — email <span className="font-mono">{DEMO_EMAIL}</span>, password{" "}
          <span className="font-mono">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </div>
  );
}
