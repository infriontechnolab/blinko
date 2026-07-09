import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Search,
  ShoppingBag,
  MapPin,
  Heart,
  User,
  ChevronDown,
  Package,
  Menu,
  LayoutGrid,
  TrendingUp,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, formatPrice } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { CartDrawer } from "@/components/cart-drawer";
import { LocationPicker } from "@/components/location-picker";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useCategoriesPanel } from "@/lib/categories-panel";
import { categories, products } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";

const isString = (v: unknown): v is string => typeof v === "string";
const trendingProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5);

function useCountdown(targetHoursFromNow: number) {
  const [end] = useState(() => Date.now() + targetHoursFromNow * 3600 * 1000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, end - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const catNav = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Shop", search: undefined as { category?: string } | undefined },
  { to: "/browse", label: "Fruits & Vegetables", search: { category: "fruits-veg" } },
  { to: "/browse", label: "Meats & Seafood", search: { category: "meats-seafood" } },
  { to: "/browse", label: "Beverages", search: { category: "beverages" } },
  { to: "/orders", label: "Orders" },
];

export function SiteHeader() {
  const { count, subtotal, setDrawerOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const [q, setQ] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [mobileCat, setMobileCat] = useState<string | null>(null);
  const [location, setLocation] = usePersistentState<string>(
    "blinko-location",
    "Noida 62",
    isString,
  );
  const [locOpen, setLocOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { category?: string } });
  const cd = useCountdown(40 * 24 + 10);
  const { open: catsOpen, toggle: toggleCats } = useCategoriesPanel();
  const isHome = pathname === "/";

  const runSearch = () => {
    const query = q.trim();
    navigate({ to: "/browse", search: query ? { q: query } : {} });
    setMobileNav(false);
    setSearchFocus(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  const needle = q.trim().toLowerCase();
  const suggestions =
    needle.length >= 2
      ? products.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 6)
      : [];

  const isActive = (to: string, sc?: { category?: string }) => {
    if (to !== pathname) return false;
    if (!sc) return !search.category;
    return search.category === sc.category;
  };

  return (
    <>
      {/* Promo top bar */}
      <div className="w-full bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-y-1 px-4 py-2 text-xs">
          <p className="flex items-center gap-2">
            <span className="hidden sm:inline">🛒</span>
            <span>
              <span className="font-semibold">Free delivery</span> & 40% discount on your first 3
              orders. Place your 1st order in.
            </span>
          </p>
          <p className="flex items-center gap-2 font-mono">
            <span className="opacity-80">Until end of sale:</span>
            <Bit v={cd.days} label="d" />
            <Bit v={cd.hours} label="h" />
            <Bit v={cd.minutes} label="m" />
            <Bit v={cd.seconds} label="s" />
          </p>
        </div>
      </div>

      {/* Utility bar */}
      <div className="hidden w-full border-b border-border bg-muted/50 md:block">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-primary">
              About Us
            </Link>
            <Link to="/orders" className="hover:text-primary">
              My Account
            </Link>
            <Link to="/wishlist" className="hover:text-primary">
              Wishlist
            </Link>
            <span className="hidden lg:inline">
              We deliver every day from{" "}
              <span className="font-mono font-semibold text-foreground">7:00–23:00</span>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button className="inline-flex items-center gap-1 hover:text-primary">
              English <ChevronDown className="size-3" />
            </button>
            <button className="inline-flex items-center gap-1 hover:text-primary">
              USD <ChevronDown className="size-3" />
            </button>
            <Link to="/orders" className="inline-flex items-center gap-1 hover:text-primary">
              <Package className="size-3.5" /> Order Tracking
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:gap-6 md:py-4">
          <button
            onClick={() => setMobileNav((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border md:hidden"
            aria-label="Menu"
          >
            <Menu className="size-4" />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src={BRAND.icon}
              alt={`${BRAND.name} logo`}
              className="size-10 shrink-0 rounded-xl object-contain"
            />
            <span className="text-2xl font-extrabold leading-none tracking-tight">
              <span className="text-foreground">{BRAND.wordmarkPrefix}</span>
              <span className="text-primary">{BRAND.wordmarkSuffix}</span>
            </span>
          </Link>

          <button
            onClick={() => setLocOpen(true)}
            className="hidden items-center gap-2 border-l border-border pl-4 text-left lg:flex"
          >
            <MapPin className="size-4 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Deliver to
              </span>
              <span className="inline-flex max-w-[10rem] items-center gap-1 truncate text-xs font-semibold">
                {location} <ChevronDown className="size-3 shrink-0" />
              </span>
            </div>
          </button>

          <div className="hidden flex-1 md:flex">
            <form onSubmit={submitSearch} role="search" className="relative w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
                placeholder="Search for products, categories or brands…"
                aria-label="Search the store"
                aria-expanded={searchFocus && suggestions.length > 0}
                className="h-11 w-full rounded-full border border-border bg-surface pl-5 pr-32 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
                aria-label="Search"
              >
                <Search className="size-4" />
                <span className="hidden lg:inline">Search</span>
              </button>

              {/* Live suggestions */}
              {searchFocus && suggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
                  <ul className="max-h-96 overflow-y-auto py-1">
                    {suggestions.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/products/$id"
                          params={{ id: p.id }}
                          onClick={() => {
                            setSearchFocus(false);
                            setQ("");
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
                        >
                          <img
                            src={p.image}
                            alt=""
                            className="size-10 shrink-0 rounded-lg object-cover"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                          <span className="shrink-0 text-sm font-semibold">
                            {formatPrice(p.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={runSearch}
                    className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-sm font-semibold text-primary hover:bg-muted"
                  >
                    <Search className="size-4" /> See all results for “{q.trim()}”
                  </button>
                </div>
              ) : null}
            </form>
          </div>

          <div className="ml-auto flex items-center gap-1 md:gap-4">
            <Link
              to="/"
              className="hidden flex-col items-center leading-tight text-foreground md:flex"
            >
              <User className="size-5" />
              <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">Account</span>
            </Link>
            <Link
              to="/wishlist"
              className="relative hidden flex-col items-center leading-tight text-foreground md:flex"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="size-5" />
                <span className="absolute -right-2 -top-1.5 grid size-4 place-items-center rounded-full bg-sale font-mono text-[9px] font-bold text-sale-foreground">
                  {wishCount}
                </span>
              </div>
              <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">Wishlist</span>
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-px"
            >
              <div className="relative">
                <ShoppingBag className="size-4" />
                <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-sale font-mono text-[9px] font-bold text-sale-foreground">
                  {count}
                </span>
              </div>
              <span className="hidden font-mono text-xs sm:inline">{formatPrice(subtotal)}</span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="border-t border-border px-4 pb-3 pt-2 md:hidden">
          <form onSubmit={submitSearch} role="search" className="relative">
            <button
              type="submit"
              aria-label="Search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Search className="size-4" />
            </button>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the store…"
              aria-label="Search the store"
              className="h-10 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </form>
        </div>

        {/* Category nav bar */}
        <nav className="hidden border-t border-border bg-background md:block">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-1.5">
            <div className="flex items-center gap-2">
              {isHome ? (
                <button
                  onClick={toggleCats}
                  aria-expanded={catsOpen}
                  aria-controls="home-categories-panel"
                  className="inline-flex w-60 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
                >
                  <LayoutGrid className="size-4 text-primary" />
                  All Categories
                  <ChevronDown
                    className={`ml-auto size-4 text-muted-foreground transition-transform ${catsOpen ? "rotate-180" : ""}`}
                  />
                </button>
              ) : null}
              <ul className="flex items-center">
                {catNav.map((c) => {
                  const active = isActive(c.to, c.search);
                  return (
                    <li key={c.label}>
                      <Link
                        to={c.to}
                        search={c.search as { category: string } | undefined}
                        className={`inline-flex items-center gap-1 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                          active
                            ? "border-primary text-primary"
                            : "border-transparent text-foreground hover:text-primary"
                        }`}
                      >
                        {c.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex items-center gap-4 text-xs">
              {/* Trending Products — hover dropdown of top-rated items */}
              <div className="group relative">
                <button className="inline-flex items-center gap-1 py-2 font-semibold text-foreground hover:text-primary">
                  <TrendingUp className="size-3.5" /> Trending Products
                  <ChevronDown className="size-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible absolute right-0 top-full z-50 w-72 translate-y-1 rounded-2xl border border-border bg-surface p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="px-2 pb-1 pt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Top rated this week
                  </p>
                  {trendingProducts.map((p) => (
                    <Link
                      key={p.id}
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                    >
                      <span className="size-11 shrink-0 overflow-hidden rounded-lg bg-white p-1">
                        <img src={p.image} alt="" className="size-full object-contain" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {p.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Star className="size-3 fill-[#f59e0b] text-[#f59e0b]" />
                          {p.rating.toFixed(1)}
                          <span className="text-muted-foreground/40">·</span>
                          <span className="font-semibold text-sale">{formatPrice(p.price)}</span>
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/browse"
                search={{ sale: true }}
                className="group inline-flex items-center gap-2 font-semibold text-sale"
              >
                <span className="relative inline-flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-sale opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-sale" />
                </span>
                Almost Finished
                <span className="animate-pulse rounded bg-sale px-1.5 py-0.5 text-[10px] font-bold text-sale-foreground">
                  SALE
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {mobileNav ? (
          <div className="border-t border-border bg-background md:hidden">
            <ul className="flex flex-col p-2">
              {catNav.map((c) => (
                <li key={c.label}>
                  <Link
                    to={c.to}
                    search={c.search as { category: string } | undefined}
                    onClick={() => setMobileNav(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-2">
              <p className="px-3 pb-1 pt-1 text-xs font-semibold text-muted-foreground">
                All Categories
              </p>
              <ul className="flex flex-col">
                {categories.map((c) => {
                  const hasSubs = c.subcategories.length > 0;
                  const open = mobileCat === c.id;
                  return (
                    <li key={c.id} className="border-b border-border/50 last:border-0">
                      <div className="flex items-center">
                        <Link
                          to="/browse"
                          search={{ category: c.id }}
                          onClick={() => setMobileNav(false)}
                          className="flex-1 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                          {c.name}
                        </Link>
                        {hasSubs ? (
                          <button
                            onClick={() => setMobileCat(open ? null : c.id)}
                            aria-expanded={open}
                            aria-label={`${open ? "Collapse" : "Expand"} ${c.name}`}
                            className="grid size-9 shrink-0 place-items-center"
                          >
                            <ChevronDown
                              className={`size-4 text-muted-foreground transition-transform ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        ) : (
                          <ChevronDown className="mr-3 size-4 -rotate-90 text-muted-foreground/40" />
                        )}
                      </div>
                      {hasSubs && open ? (
                        <ul className="mb-1 space-y-0.5 rounded-md bg-muted/40 px-2 py-1">
                          {c.subcategories.map((s) => (
                            <li key={s.id}>
                              <Link
                                to="/browse"
                                search={{ category: c.id }}
                                onClick={() => setMobileNav(false)}
                                className="block rounded px-3 py-1.5 text-sm text-muted-foreground hover:text-primary"
                              >
                                {s.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer />
      <LocationPicker
        open={locOpen}
        value={location}
        onClose={() => setLocOpen(false)}
        onSelect={(l) => {
          setLocation(l);
          setLocOpen(false);
        }}
      />
    </>
  );
}

function Bit({ v, label }: { v: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="rounded bg-background/15 px-1 py-0.5 font-bold">
        {String(v).padStart(2, "0")}
      </span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}
