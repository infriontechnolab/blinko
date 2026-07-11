import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Truck, MapPin, Search, ShoppingBag, RotateCcw, Tag } from "lucide-react";
import {
  getStoreBySlug,
  productsByStore,
  categories,
  pastOrders,
  discountPct,
} from "@/lib/mock-data";
import { useOrders } from "@/lib/orders-store";
import { ProductCard, Stars } from "@/components/product-card";
import { storeLogoUrl } from "@/components/store-card";
import { StoreDetailSkeleton } from "@/components/skeletons";
import { BRAND } from "@/lib/brand";

type StoreTab = "shop" | "again" | "offers";

const STORE_TABS: { id: StoreTab; label: string; icon: typeof ShoppingBag }[] = [
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "again", label: "Buy it again", icon: RotateCcw },
  { id: "offers", label: "Offers", icon: Tag },
];

const storeSearch = z.object({
  // Deep-link a specific tab, e.g. from the Offers page: /store/spice-hub?tab=offers
  tab: z.enum(["shop", "again", "offers"]).optional(),
});

export const Route = createFileRoute("/store/$slug")({
  validateSearch: storeSearch,
  loader: ({ params }) => {
    const store = getStoreBySlug(params.slug);
    if (!store) throw notFound();
    return { store, products: productsByStore(store.id) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.store.name} — ${BRAND.name}` },
          { name: "description", content: loaderData.store.description },
          { property: "og:title", content: `${loaderData.store.name} — ${BRAND.name}` },
          { property: "og:description", content: loaderData.store.description },
        ]
      : [{ title: `Store — ${BRAND.name}` }],
  }),
  component: StorePage,
  pendingComponent: StoreDetailSkeleton,
});

function StorePage() {
  const { store, products } = Route.useLoaderData();
  const { tab: initialTab } = Route.useSearch();
  const { stored } = useOrders();
  const [tab, setTab] = useState<StoreTab>(initialTab ?? "shop");
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"latest" | "low" | "high" | "rating">("latest");

  // Product ids this customer has ordered before (placed + demo past orders),
  // used to populate the "Buy it again" tab.
  const reorderIds = useMemo(() => {
    const ids = new Set<string>();
    for (const o of [...stored, ...pastOrders]) for (const it of o.items) ids.add(it.productId);
    return ids;
  }, [stored]);

  // Categories actually present in this store, for the sidebar filter.
  const storeCats = useMemo(() => {
    const ids = new Set(products.map((p) => p.categoryId));
    return categories.filter((c) => ids.has(c.id));
  }, [products]);

  const offersCount = useMemo(() => products.filter((p) => discountPct(p) > 0).length, [products]);
  const againCount = useMemo(
    () => products.filter((p) => reorderIds.has(p.id)).length,
    [products, reorderIds],
  );

  const byTab = useMemo(() => {
    if (tab === "again") return products.filter((p) => reorderIds.has(p.id));
    if (tab === "offers") return products.filter((p) => discountPct(p) > 0);
    return products;
  }, [products, tab, reorderIds]);

  const filtered = useMemo(() => {
    let out = byTab.slice();
    if (cat) out = out.filter((p) => p.categoryId === cat);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle),
      );
    }
    if (sort === "low") out.sort((a, b) => a.price - b.price);
    if (sort === "high") out.sort((a, b) => b.price - a.price);
    if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
    return out;
  }, [byTab, cat, q, sort]);

  const tabCount = (id: StoreTab) =>
    id === "again" ? againCount : id === "offers" ? offersCount : products.length;

  const emptyMessage =
    tab === "again"
      ? "You haven't ordered from this store yet. Your reorders will show up here."
      : tab === "offers"
        ? "No offers running at this store right now."
        : products.length === 0
          ? "This store hasn't listed any products yet."
          : "No products match your search.";

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to="/" className="hover:text-foreground">
          Store
        </Link>
        <span>/</span>
        <span className="text-foreground">{store.name}</span>
      </nav>

      {/* Store header */}
      <div
        className="relative overflow-hidden rounded-3xl border border-border p-6 md:p-10"
        style={{
          background: `linear-gradient(135deg, ${store.accent}33 0%, ${store.accent}11 60%, transparent 100%)`,
        }}
      >
        <span
          className={`absolute right-4 top-4 rounded-md px-2 py-0.5 text-xs font-semibold shadow-sm ${
            store.isOpen ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {store.isOpen ? "Open now" : "Closed"}
        </span>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-surface bg-white p-2.5 shadow-md">
            <img
              src={storeLogoUrl(store)}
              alt={`${store.name} logo`}
              loading="lazy"
              className="size-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold md:text-3xl">{store.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{store.tagline}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <Stars rating={store.rating} />
              <span className="font-mono text-xs text-muted-foreground">
                {store.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm text-foreground/80">{store.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {store.address}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {store.distanceKm} km away
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-3.5" />
            Free delivery over ${store.freeDeliveryThreshold}
          </span>
        </div>
      </div>

      {/* Tabbed catalogue with category sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit lg:sticky lg:top-24">
          {/* Store identity + section tabs */}
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-white p-1.5">
                <img
                  src={storeLogoUrl(store)}
                  alt={`${store.name} logo`}
                  loading="lazy"
                  className="size-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">{store.name}</h2>
                <p className="text-xs text-muted-foreground">{store.distanceKm} km away</p>
              </div>
            </div>
            <nav className="mt-4 space-y-1">
              {STORE_TABS.map((t) => {
                const active = t.id === tab;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="flex-1 text-left">{t.label}</span>
                    <span
                      className={`font-mono text-xs ${
                        active ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {tabCount(t.id)}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Category filter */}
          {storeCats.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Categories
              </p>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => setCat(null)}
                    className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                      !cat
                        ? "font-semibold text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All products
                  </button>
                </li>
                {storeCats.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setCat(c.id)}
                      className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                        cat === c.id
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>

        {/* Products */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold md:text-2xl">
              {STORE_TABS.find((t) => t.id === tab)?.label} · {store.name}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search this store…"
                  aria-label={`Search products from ${store.name}`}
                  className="h-9 w-48 rounded-full border border-border bg-surface pl-9 pr-3 text-xs outline-none focus:border-primary sm:w-64"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                aria-label="Sort products"
              >
                <option value="latest">Sort by latest</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
