import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, ShoppingBasket, MapPin, Heart, User, ChevronDown, Package, Menu, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, formatPrice } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { CartDrawer } from "@/components/cart-drawer";
import { useCategoriesPanel } from "@/lib/categories-panel";
import { categories } from "@/lib/mock-data";

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
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { category?: string } });
  const cd = useCountdown(40 * 24 + 10);
  const { open: catsOpen, toggle: toggleCats } = useCategoriesPanel();
  const isHome = pathname === "/";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    navigate({ to: "/browse", search: query ? { q: query } : {} });
    setMobileNav(false);
  };

  const isActive = (to: string, sc?: { category?: string }) => {
    if (to !== pathname) return false;
    if (!sc) return !search.category;
    return search.category === sc.category;
  };

  return (
    <>
      {/* Promo top bar */}
      <div className="w-full bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-1 px-4 py-2 text-xs">
          <p className="flex items-center gap-2">
            <span className="hidden sm:inline">🛒</span>
            <span>
              <span className="font-semibold">Free delivery</span> & 40% discount on your first 3 orders. Place your 1st order in.
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
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-primary">About Us</Link>
            <Link to="/orders" className="hover:text-primary">My Account</Link>
            <Link to="/wishlist" className="hover:text-primary">Wishlist</Link>
            <span className="hidden lg:inline">
              We deliver every day from <span className="font-mono font-semibold text-foreground">7:00–23:00</span>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button className="inline-flex items-center gap-1 hover:text-primary">
              English <ChevronDown className="size-3" />
            </button>
            <button className="inline-flex items-center gap-1 hover:text-primary">
              INR <ChevronDown className="size-3" />
            </button>
            <Link to="/orders" className="inline-flex items-center gap-1 hover:text-primary">
              <Package className="size-3.5" /> Order Tracking
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:gap-6 md:py-4">
          <button
            onClick={() => setMobileNav((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border md:hidden"
            aria-label="Menu"
          >
            <Menu className="size-4" />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShoppingBasket className="size-5" />
            </span>
            <span className="text-2xl font-extrabold leading-none tracking-tight">
              <span className="text-foreground">Apna</span>
              <span className="text-primary">Mandi</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 border-l border-border pl-4 lg:flex">
            <MapPin className="size-4 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Deliver to
              </span>
              <button className="inline-flex items-center gap-1 text-xs font-semibold">
                Noida 62 <ChevronDown className="size-3" />
              </button>
            </div>
          </div>

          <div className="hidden flex-1 md:flex">
            <form onSubmit={submitSearch} role="search" className="relative w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for products, categories or brands…"
                aria-label="Search the store"
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
              <span className="hidden font-mono text-xs sm:inline">
                {formatPrice(subtotal)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="border-t border-border px-4 pb-3 pt-2 md:hidden">
          <form onSubmit={submitSearch} role="search" className="relative">
            <button type="submit" aria-label="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
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
              <button className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary">
                Trending Products <ChevronDown className="size-3" />
              </button>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 font-semibold text-sale"
              >
                Almost Finished
                <span className="rounded bg-sale px-1.5 py-0.5 text-[10px] font-bold text-sale-foreground">
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
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/browse"
                      search={{ category: c.id }}
                      onClick={() => setMobileNav(false)}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      {c.name}
                      <ChevronDown className="size-4 -rotate-90 text-muted-foreground/50" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer />
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
