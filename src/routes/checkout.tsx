import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CreditCard, MapPin, Clock, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-store";
import { useOrders, newOrderId } from "@/lib/orders-store";
import { getProduct } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: `Checkout — ${BRAND.name}` }] }),
  component: Checkout,
});

const slots = [
  { id: "s1", label: "Today · 5–9 PM", note: "Evening" },
  { id: "s2", label: "Tomorrow · 11 AM–3 PM", note: "Morning" },
  { id: "s3", label: "Tomorrow · 5–9 PM", note: "Evening" },
];

const payments = [
  { id: "gpay", label: "Google Pay", note: "Pay with your Google account" },
  { id: "applepay", label: "Apple Pay", note: "Pay with Touch ID or Face ID" },
  { id: "card", label: "Credit / Debit card", note: "Visa, Mastercard, Amex" },
];

// --- Card helpers for the (simulated) card form: brand detection, live
// formatting and a Luhn check. No real gateway — nothing leaves the browser. ---
type CardBrand = { id: string; label: string; cvcLen: number; len: number; gaps: number[] };

const CARD_BRANDS: { test: RegExp; brand: CardBrand }[] = [
  { test: /^4/, brand: { id: "visa", label: "VISA", cvcLen: 3, len: 16, gaps: [4, 8, 12] } },
  { test: /^3[47]/, brand: { id: "amex", label: "AMEX", cvcLen: 4, len: 15, gaps: [4, 10] } },
  {
    test: /^(5[1-5]|2[2-7])/,
    brand: { id: "mastercard", label: "Mastercard", cvcLen: 3, len: 16, gaps: [4, 8, 12] },
  },
  {
    test: /^(6011|64[4-9]|65)/,
    brand: { id: "discover", label: "Discover", cvcLen: 3, len: 16, gaps: [4, 8, 12] },
  },
];

const GENERIC_BRAND: CardBrand = {
  id: "card",
  label: "Card",
  cvcLen: 3,
  len: 16,
  gaps: [4, 8, 12],
};

function detectBrand(digits: string): CardBrand {
  return CARD_BRANDS.find((b) => b.test.test(digits))?.brand ?? GENERIC_BRAND;
}

function formatCardNumber(digits: string, brand: CardBrand): string {
  const d = digits.slice(0, brand.len);
  let out = "";
  for (let i = 0; i < d.length; i++) {
    if (brand.gaps.includes(i)) out += " ";
    out += d[i];
  }
  return out;
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { place: placeOrder } = useOrders();
  const [slot, setSlot] = useState("s1");
  const [payment, setPayment] = useState("gpay");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof typeof card, string>>>({});
  const [stage, setStage] = useState<"idle" | "processing" | "approved">("idle");
  const brand = detectBrand(card.number.replace(/\D/g, ""));
  const [address, setAddress] = useState({
    name: "Emily Carter",
    line1: "21 Queen Mary Drive",
    line2: "Unit 4",
    city: "Brampton, ON",
    pincode: "L7A 1X7",
    phone: "+1 416 555 0142",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof address, string>>>({});

  const setField = (key: keyof typeof address, v: string) => {
    setAddress((a) => ({ ...a, [key]: v }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validate = () => {
    const e: Partial<Record<keyof typeof address, string>> = {};
    if (!address.name.trim()) e.name = "Enter a name";
    const phone = address.phone.replace(/\D/g, "").slice(-10);
    if (phone.length !== 10 || !/^[2-9]/.test(phone))
      e.phone = "Enter a valid 10-digit phone number";
    if (!address.line1.trim()) e.line1 = "Enter an address";
    if (!address.city.trim()) e.city = "Enter a city";
    if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(address.pincode.trim()))
      e.pincode = "Enter a valid postal code (e.g. L7A 1X7)";
    return e;
  };

  const setCardField = (key: keyof typeof card, v: string) => {
    setCard((c) => ({ ...c, [key]: v }));
    setCardErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const onExpiryChange = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    setCardField("expiry", d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  const validateCard = () => {
    const e: Partial<Record<keyof typeof card, string>> = {};
    const digits = card.number.replace(/\D/g, "");
    if (digits.length !== brand.len || !luhnValid(digits)) e.number = "Enter a valid card number";
    if (!card.name.trim()) e.name = "Enter the name on the card";
    const [mm, yy] = card.expiry.split("/");
    const m = Number(mm);
    const y = Number(yy);
    const now = new Date();
    const curYY = now.getFullYear() % 100;
    const curMM = now.getMonth() + 1;
    if (!mm || !yy || m < 1 || m > 12 || y < curYY || (y === curYY && m < curMM))
      e.expiry = "Check expiry";
    if (card.cvc.length !== brand.cvcLen) e.cvc = `${brand.cvcLen} digits`;
    return e;
  };

  // Amounts are stored in INR (÷83 on display): free over ~$35, else a ~$4.99 fee.
  const deliveryFee = subtotal >= 2905 || subtotal === 0 ? 0 : 414;
  const total = subtotal + deliveryFee;

  const place = () => {
    const e = validate();
    const ce = payment === "card" ? validateCard() : {};
    setErrors(e);
    setCardErrors(ce);
    if (Object.keys(e).length > 0 || Object.keys(ce).length > 0) return;

    // Simulated gateway: a short processing → approved animation, then the
    // order is snapshotted. Nothing is charged — no real gateway is contacted.
    setStage("processing");

    const id = newOrderId();
    const orderItems = items
      .map((it) => {
        const p = getProduct(it.productId);
        return p ? { productId: it.productId, qty: it.qty, price: p.price } : null;
      })
      .filter((x): x is { productId: string; qty: number; price: number } => x !== null);

    setTimeout(() => setStage("approved"), 1500);
    setTimeout(() => {
      placeOrder({
        id,
        placedAt: new Date().toISOString(),
        items: orderItems,
        subtotal,
        delivery: deliveryFee,
        total,
        address: `${address.line1}, ${address.city}, ${address.pincode}`,
      });
      clear();
      navigate({ to: "/orders/$id", params: { id }, search: { just_placed: 1 } });
    }, 2400);
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
                label="Postal code"
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
                      <span className="ml-auto flex items-center gap-1.5">
                        {p.id === "gpay" ? <GPayMark /> : null}
                        {p.id === "applepay" ? <ApplePayMark /> : null}
                        {p.id === "card" ? (
                          <>
                            <VisaMark />
                            <MastercardMark />
                            <AmexMark />
                          </>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {payment === "card" ? (
              <div className="mt-4 space-y-4">
                {/* Live card preview */}
                <div
                  className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
                  style={{
                    background: "linear-gradient(135deg,#282433 0%,#3b3550 55%,#5b4a70 100%)",
                  }}
                >
                  <div
                    className="absolute -right-10 -top-10 size-40 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle,#fff,transparent 70%)" }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" />
                    <span className="font-mono text-sm font-bold tracking-widest">
                      {brand.label}
                    </span>
                  </div>
                  <p className="mt-6 font-mono text-lg tracking-[0.18em]">
                    {formatCardNumber(card.number, brand) || "•••• •••• •••• ••••"}
                  </p>
                  <div className="mt-4 flex items-end justify-between text-xs">
                    <span className="max-w-[60%] truncate font-medium uppercase tracking-wide">
                      {card.name || "Cardholder name"}
                    </span>
                    <span className="font-mono">{card.expiry || "MM/YY"}</span>
                  </div>
                </div>

                {/* Card fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="Card number"
                    value={formatCardNumber(card.number, brand)}
                    onChange={(v) =>
                      setCardField("number", v.replace(/\D/g, "").slice(0, brand.len))
                    }
                    error={cardErrors.number}
                    full
                  />
                  <Field
                    label="Name on card"
                    value={card.name}
                    onChange={(v) => setCardField("name", v)}
                    error={cardErrors.name}
                    full
                  />
                  <Field
                    label="Expiry (MM/YY)"
                    value={card.expiry}
                    onChange={onExpiryChange}
                    error={cardErrors.expiry}
                  />
                  <Field
                    label={`CVC (${brand.cvcLen})`}
                    value={card.cvc}
                    onChange={(v) =>
                      setCardField("cvc", v.replace(/\D/g, "").slice(0, brand.cvcLen))
                    }
                    error={cardErrors.cvc}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Test mode — try <span className="font-mono">4242 4242 4242 4242</span>, any future
                  date and CVC.
                </p>
              </div>
            ) : (
              <button
                onClick={place}
                disabled={stage !== "idle"}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-sm transition-transform hover:-translate-y-px disabled:opacity-60"
                style={
                  payment === "gpay"
                    ? { background: "#fff", color: "#3c4043", border: "1px solid #dadce0" }
                    : { background: "#000", color: "#fff" }
                }
              >
                {payment === "gpay" ? "Pay with Google Pay" : "Pay with Apple Pay"}
              </button>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="size-3" /> Secured checkout · test mode — no real charge
            </p>
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
            disabled={stage !== "idle"}
            className="mt-5 grid w-full place-items-center rounded-lg bg-ink py-3.5 text-sm font-semibold text-background transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            {stage !== "idle"
              ? "Processing…"
              : payment === "card"
                ? `Pay ${formatPrice(total)}`
                : `Place order · ${formatPrice(total)}`}
          </button>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {BRAND.tagline} · {BRAND.name}
          </p>
        </aside>
      </div>

      {/* Simulated payment processing overlay */}
      {stage !== "idle" ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-[min(90vw,340px)] rounded-2xl bg-background p-8 text-center shadow-2xl">
            {stage === "processing" ? (
              <>
                <Loader2 className="mx-auto size-10 animate-spin text-primary" />
                <h3 className="mt-4 font-heading text-lg font-bold">Processing payment…</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {payment === "card"
                    ? `Authorizing your ${brand.label} card`
                    : `Confirming with ${payment === "gpay" ? "Google Pay" : "Apple Pay"}`}
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-success text-success-foreground">
                  <Check className="size-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">Payment approved</h3>
                <p className="mt-1 text-sm text-muted-foreground">Placing your order…</p>
              </>
            )}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3" /> {formatPrice(total)} · {BRAND.name} secure checkout
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* --- Payment brand marks (inline SVG / styled, no external assets) --- */
function VisaMark() {
  return (
    <span className="grid h-6 w-9 place-items-center rounded border border-border bg-white text-[10px] font-bold italic tracking-tight text-[#1434cb]">
      VISA
    </span>
  );
}
function MastercardMark() {
  return (
    <span className="grid h-6 w-9 place-items-center rounded border border-border bg-white">
      <svg viewBox="0 0 32 20" className="h-3.5" aria-hidden>
        <circle cx="13" cy="10" r="7" fill="#eb001b" />
        <circle cx="19" cy="10" r="7" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    </span>
  );
}
function AmexMark() {
  return (
    <span className="grid h-6 w-9 place-items-center rounded bg-[#2e77bc] text-[8px] font-bold tracking-tight text-white">
      AMEX
    </span>
  );
}
function GPayMark() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded border border-border bg-white px-2 text-[11px] font-medium text-[#5f6368]">
      <span className="font-bold text-[#4285f4]">G</span> Pay
    </span>
  );
}
function ApplePayMark() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded bg-black px-2 text-[11px] font-semibold text-white">
      <svg viewBox="0 0 16 20" className="h-3 fill-white" aria-hidden>
        <path d="M10.9 3.2c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2zM12.8 10.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1z" />
      </svg>
      Pay
    </span>
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
