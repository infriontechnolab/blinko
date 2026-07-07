import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CreditCard, MapPin, Clock } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-store";
import { useOrders, newOrderId } from "@/lib/orders-store";
import { getProduct } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: `Checkout — ${BRAND.name}` }] }),
  component: Checkout,
});

const slots = [
  { id: "s1", label: "Today · 6–7 PM", note: "Standard" },
  { id: "s2", label: "Today · 7–8 PM", note: "Standard" },
  { id: "s3", label: "Tomorrow · 8–9 AM", note: "Morning" },
  { id: "s4", label: "Tomorrow · 10–11 AM", note: "Morning" },
];

const payments = [
  { id: "upi", label: "UPI", note: "Pay with any UPI app" },
  { id: "card", label: "Credit / Debit card", note: "Visa, Mastercard, Rupay" },
  { id: "cod", label: "Cash on delivery", note: "Pay when it arrives" },
];

function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { place: placeOrder } = useOrders();
  const [slot, setSlot] = useState("s1");
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    name: "Anaya Sharma",
    line1: "Flat 402, Tower B",
    line2: "Green Meadows, Sector 62",
    city: "Noida",
    pincode: "201309",
    phone: "+91 98765 43210",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof address, string>>>({});

  const setField = (key: keyof typeof address, v: string) => {
    setAddress((a) => ({ ...a, [key]: v }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validate = () => {
    const e: Partial<Record<keyof typeof address, string>> = {};
    if (!address.name.trim()) e.name = "Enter a name";
    const mobile = address.phone.replace(/\D/g, "").slice(-10);
    if (mobile.length !== 10 || !/^[6-9]/.test(mobile)) e.phone = "Enter a valid 10-digit mobile";
    if (!address.line1.trim()) e.line1 = "Enter an address";
    if (!address.city.trim()) e.city = "Enter a city";
    if (!/^\d{6}$/.test(address.pincode.trim())) e.pincode = "Enter a 6-digit pincode";
    return e;
  };

  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 29;
  const total = subtotal + deliveryFee;

  const place = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setPlacing(true);

    // Snapshot the real basket into a stored order — this is what the tracker
    // and order history read back, in place of the old hardcoded AM-9402.
    const id = newOrderId();
    const orderItems = items
      .map((it) => {
        const p = getProduct(it.productId);
        return p ? { productId: it.productId, qty: it.qty, price: p.price } : null;
      })
      .filter((x): x is { productId: string; qty: number; price: number } => x !== null);

    placeOrder({
      id,
      placedAt: new Date().toISOString(),
      items: orderItems,
      subtotal,
      delivery: deliveryFee,
      total,
      address: `${address.line1}, ${address.city}, ${address.pincode}`,
    });

    setTimeout(() => {
      clear();
      navigate({ to: "/orders/$id", params: { id }, search: { just_placed: 1 } });
    }, 900);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl font-bold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your basket is empty — add something first.
        </p>
        <Link
          to="/browse"
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Browse the store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Checkout
        </p>
        <h1 className="mt-1 font-heading text-4xl font-bold">Almost there.</h1>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Address */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Step 1
                </p>
                <h2 className="font-heading text-lg font-bold">Delivery address</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                label="Full name"
                value={address.name}
                onChange={(v) => setField("name", v)}
                error={errors.name}
              />
              <Field
                label="Phone"
                value={address.phone}
                onChange={(v) => setField("phone", v)}
                error={errors.phone}
              />
              <Field
                label="Address line 1"
                value={address.line1}
                onChange={(v) => setField("line1", v)}
                error={errors.line1}
                full
              />
              <Field
                label="Address line 2"
                value={address.line2}
                onChange={(v) => setField("line2", v)}
                full
              />
              <Field
                label="City"
                value={address.city}
                onChange={(v) => setField("city", v)}
                error={errors.city}
              />
              <Field
                label="Pincode"
                value={address.pincode}
                onChange={(v) => setField("pincode", v)}
                error={errors.pincode}
              />
            </div>
          </section>

          {/* Slot */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <Clock className="size-4" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Step 2
                </p>
                <h2 className="font-heading text-lg font-bold">Delivery slot</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {slots.map((s) => {
                const active = s.id === slot;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSlot(s.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-background hover:border-foreground/25"
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.note}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{s.label}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="size-4" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Step 3
                </p>
                <h2 className="font-heading text-lg font-bold">Payment</h2>
              </div>
            </div>
            <ul className="space-y-2">
              {payments.map((p) => {
                const active = p.id === payment;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setPayment(p.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border bg-background hover:border-foreground/25"
                      }`}
                    >
                      <div
                        className={`grid size-5 place-items-center rounded-full border-2 ${
                          active ? "border-primary bg-primary" : "border-border"
                        }`}
                      >
                        {active ? <Check className="size-3 text-primary-foreground" /> : null}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.note}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Your basket
          </p>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((it) => {
              const p = getProduct(it.productId);
              if (!p) return null;
              return (
                <li key={it.productId} className="flex items-center gap-3">
                  <div className="size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                    <img src={p.image} alt="" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {it.qty} × {formatPrice(p.price)}
                    </p>
                  </div>
                  <span className="font-mono text-sm">{formatPrice(p.price * it.qty)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <Row k="Subtotal" v={formatPrice(subtotal)} />
            <Row k="Delivery" v={deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)} />
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-heading text-base font-bold">Total</span>
            <span className="font-mono text-2xl font-bold">{formatPrice(total)}</span>
          </div>
          <button
            onClick={place}
            disabled={placing}
            className="mt-5 grid w-full place-items-center rounded-lg bg-ink py-3.5 text-sm font-semibold text-background transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            One store · One promise · {BRAND.name}
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "md:col-span-2" : ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 ${
          error
            ? "border-sale focus:border-sale focus:ring-sale/15"
            : "border-border focus:border-primary focus:ring-primary/15"
        }`}
      />
      {error ? <span className="text-[11px] font-medium text-sale">{error}</span> : null}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-mono">{v}</dd>
    </div>
  );
}
