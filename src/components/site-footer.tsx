import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  Sunrise,
  ShieldCheck,
  DollarSign,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

const PROMISES: { icon: typeof Sunrise; title: string; body: string }[] = [
  {
    icon: Sunrise,
    title: "The 6 AM Market Run",
    body: "We're at the market at dawn, haggling over the good stuff, so you never have to.",
  },
  {
    icon: ShieldCheck,
    title: "Fresh-or-Free, Always",
    body: "Not the best produce you've seen this week? We refund it. No forms, no arguments.",
  },
  {
    icon: DollarSign,
    title: "The Honest Market Price",
    body: "Farmer-direct, no middleman markup — and every basket weighed to the last gram.",
  },
  {
    icon: Truck,
    title: "Before the Chai Cools",
    body: "Cold-chain packed and on your doorstep across the city in minutes, not days.",
  },
];

const STATS: { value: string; label: string }[] = [
  { value: "2.4M", label: "baskets packed & counting" },
  { value: "1,200+", label: "farmers on first-name terms" },
  { value: "38", label: "cities, one single standard" },
  { value: "9 min", label: "average run to your door" },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      {/* Promise band — the four things we'd stake the shop on */}
      <section className="border-t border-border bg-kraft/60">
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            The {BRAND.name} Promise
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center font-heading text-2xl font-bold md:text-3xl">
            Four things we'd stake the whole shop on.
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col items-start">
                <span className="grid size-12 place-items-center rounded-2xl bg-surface text-primary shadow-sm ring-1 ring-border">
                  <Icon className="size-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-bold">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip — proof, in tabular figures */}
      <section className="border-t border-border bg-ink text-background">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-8 px-4 py-10 md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-mono text-3xl font-extrabold tracking-tight md:text-4xl">
                {value}
              </p>
              <p className="mx-auto mt-1 max-w-[14ch] text-[11px] leading-snug text-background/60">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="font-heading text-2xl font-bold">
              The freshest email you'll get all week
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              One note every Sunday — what's in season, what's cheap, what's worth cooking. First
              order gets $1.20 off. We never spam; we're too busy at the market.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubscribed(true);
            }}
            className="flex w-full max-w-md items-center overflow-hidden rounded-full border border-border bg-surface md:w-[440px]"
          >
            <Mail className="ml-4 size-4 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              type="email"
              className="h-11 flex-1 bg-transparent px-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground"
            >
              {subscribed ? "You're in" : "Send it"}
            </button>
          </form>
        </div>
        <p className="mx-auto max-w-[1440px] px-4 pb-4 text-[11px] text-muted-foreground">
          By subscribing you agree to our{" "}
          <span className="text-primary underline-offset-2 hover:underline">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="text-primary underline-offset-2 hover:underline">
            Privacy & Cookies Policy
          </span>
          .
        </p>
      </section>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 px-4 py-14 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src={BRAND.icon}
                alt={`${BRAND.name} logo`}
                className="size-10 shrink-0 rounded-xl object-contain"
              />
              <span className="text-xl font-extrabold leading-none tracking-tight">
                <span className="text-foreground">{BRAND.wordmarkPrefix}</span>
                <span className="text-primary">{BRAND.wordmarkSuffix}</span>
              </span>
            </div>
            <h4 className="mt-6 text-sm font-bold">{BRAND.tagline}</h4>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Started by folks who couldn't find a single tomato worth buying online. So we built
              the shop we wanted — one basket, one promise, packed the same way whether it's for our
              home or yours.
            </p>
            <div className="mt-4 flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-muted text-primary">
                <Phone className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Every day, 6am–11pm
                </p>
                <p className="font-heading text-lg font-bold">
                  1800 200 {BRAND.name.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-muted text-primary">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  A real human replies
                </p>
                <p className="text-sm font-semibold">{BRAND.supportEmail}</p>
              </div>
            </div>
          </div>

          <FooterCol
            title="Fill the Basket"
            links={[
              ["Fresh Off the Farm", "/browse"],
              ["Pantry & Staples", "/browse"],
              ["Dairy & Eggs", "/browse"],
              ["Snack Attack", "/browse"],
              ["Chai & Beverages", "/browse"],
            ]}
          />
          <FooterCol
            title="We've Got You"
            links={[
              ["Track My Order", "/orders"],
              ["Fresh-or-Free Refunds", "/"],
              ["Returns & Replacements", "/"],
              ["Delivery Areas & Slots", "/"],
              ["Accessibility", "/"],
              ["Privacy Policy", "/"],
            ]}
          />
          <FooterCol
            title="The Shop Behind It"
            links={[
              [`Our ${BRAND.name} Story`, "/"],
              ["Meet the Farmers", "/"],
              ["Work With Us", "/"],
              [`Sell on ${BRAND.name}`, "/"],
              ["What Shoppers Say", "/"],
              ["Sourcing & Ethics", "/"],
            ]}
          />

          <div>
            <h4 className="font-bold">Shop from your pocket</h4>
            <div className="mt-3 flex flex-col gap-3">
              <StoreBadge
                src="/google-play-button.png"
                alt="Get it on Google Play"
                note="10% Off"
              />
              <StoreBadge
                src="/apple-store-button.png"
                alt="Download on the App Store"
                note="$1.20 Off"
              />
            </div>
            <h4 className="mt-6 text-sm font-bold">Come say hi:</h4>
            <div className="mt-3 flex items-center gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid size-9 place-items-center rounded-full bg-muted text-primary hover:bg-primary hover:text-primary-foreground"
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-muted-foreground">
            <p>Packed with care in India 🇮🇳 · Weighed honestly, every single time.</p>
            <div className="flex items-center gap-3 font-mono">
              <span className="rounded bg-muted px-2 py-1 font-bold text-[#1a1f71]">VISA</span>
              <span className="rounded bg-muted px-2 py-1 font-bold text-[#eb001b]">●●</span>
              <span className="rounded bg-muted px-2 py-1 font-bold text-primary">UPI</span>
              <span className="rounded bg-muted px-2 py-1 font-bold text-[#003087]">PayPal</span>
              <span className="rounded bg-muted px-2 py-1 font-bold text-foreground">COD</span>
            </div>
            <div className="flex gap-4">
              <Link to="/" className="hover:text-primary">
                Terms & Conditions
              </Link>
              <Link to="/" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link to="/orders" className="hover:text-primary">
                Order Tracking
              </Link>
            </div>
          </div>
          <p className="mx-auto max-w-[1440px] px-4 pb-4 text-[11px] text-muted-foreground">
            © 2026 <span className="font-semibold text-foreground">{BRAND.name}</span> Grocery Co.
            All rights reserved. No tomato was oversold in the making of this store.
          </p>
        </div>
      </footer>
    </>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-bold">{title}</h4>
      <ul className="mt-3 space-y-2 text-xs">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-muted-foreground hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoreBadge({ src, alt, note }: { src: string; alt: string; note: string }) {
  return (
    <a href="#" className="flex items-center gap-3 transition-opacity hover:opacity-90">
      <img src={src} alt={alt} className="h-11 w-auto shrink-0" width={150} height={48} />
      <span className="whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
        {note}
      </span>
    </a>
  );
}
