import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgePercent, Tag, Clock, ArrowRight } from "lucide-react";
import { stores, products, discountPct, type Store, type Product } from "@/lib/mock-data";
import { formatPrice } from "@/lib/cart-store";
import { storeLogoUrl } from "@/components/store-card";
import { onImgError } from "@/lib/img";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: `Offers — ${BRAND.name}` },
      { name: "description", content: `Live deals across every store on ${BRAND.name}.` },
    ],
  }),
  component: OffersPage,
});

type StoreOffers = { store: Store; offers: Product[]; maxOff: number };

function OffersPage() {
  // Group active (discounted) products by store, richest offers first.
  const storeOffers: StoreOffers[] = stores
    .map((store) => {
      const offers = products.filter((p) => p.seller_id === store.id && discountPct(p) > 0);
      const maxOff = offers.reduce((m, p) => Math.max(m, discountPct(p)), 0);
      return { store, offers, maxOff };
    })
    .filter((s) => s.offers.length > 0)
    .sort((a, b) => b.maxOff - a.maxOff || b.offers.length - a.offers.length);

  const totalDeals = storeOffers.reduce((n, s) => n + s.offers.length, 0);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-sale/10 p-6 md:p-10">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-sale">
          <BadgePercent className="size-3.5" /> Live offers
        </p>
        <h1 className="mt-2 max-w-2xl text-2xl font-bold leading-tight md:text-4xl">
          Deals running right now, store by store
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {totalDeals} deals across {storeOffers.length} stores on {BRAND.name}. Tap a store to see
          everything on offer there.
        </p>
      </section>

      {storeOffers.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
          No offers are running right now — check back soon.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {storeOffers.map((s) => (
            <StoreOfferCard key={s.store.id} data={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function StoreOfferCard({ data }: { data: StoreOffers }) {
  const { store, offers, maxOff } = data;
  const preview = offers.slice(0, 3);

  return (
    <Link
      to="/store/$slug"
      params={{ slug: store.slug }}
      search={{ tab: "offers" }}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-sale/40 hover:shadow-md"
    >
      {/* Store identity + headline offer badge */}
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-white p-1.5">
          <img
            src={storeLogoUrl(store)}
            alt={`${store.name} logo`}
            loading="lazy"
            className="size-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold group-hover:text-sale">{store.name}</h2>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {store.isOpen ? "Open now" : "Closed"} · {store.distanceKm} km
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-sale px-2.5 py-1 text-center text-xs font-bold leading-tight text-sale-foreground">
          Up to
          <br />
          {maxOff}% off
        </span>
      </div>

      {/* Offer count pill */}
      <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-sale/10 px-2.5 py-1 text-[11px] font-semibold text-sale">
        <Tag className="size-3" />
        {offers.length} {offers.length === 1 ? "deal" : "deals"} running
      </p>

      {/* Deal previews */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {preview.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-background p-1.5">
            <div className="relative aspect-square overflow-hidden rounded-md bg-white">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                onError={onImgError}
                className="size-full object-contain"
              />
              <span className="absolute left-1 top-1 rounded bg-sale px-1 py-0.5 text-[9px] font-bold text-sale-foreground">
                {discountPct(p)}%
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{p.name}</p>
            <p className="text-[11px] font-semibold">{formatPrice(p.price)}</p>
          </div>
        ))}
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sale">
        See all offers{" "}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
