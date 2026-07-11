import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Truck, MapPin, Search } from "lucide-react";
import { getStoreBySlug, productsByStore } from "@/lib/mock-data";
import { ProductCard, Stars } from "@/components/product-card";
import { storeLogoUrl } from "@/components/store-card";
import { StoreDetailSkeleton } from "@/components/skeletons";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/store/$slug")({
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
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"latest" | "low" | "high" | "rating">("latest");

  const filtered = useMemo(() => {
    let out = products.slice();
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
  }, [products, q, sort]);

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
            <Clock className="size-3.5" /> {store.deliveryTime} delivery
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-3.5" />
            {store.deliveryCharge === "Free"
              ? "Free delivery"
              : `${store.deliveryCharge} delivery fee`}
          </span>
        </div>
      </div>

      {/* Products from this store */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold md:text-2xl">Products from {store.name}</h2>
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
            {products.length === 0
              ? "This store hasn't listed any products yet."
              : "No products match your search."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
