import { Link } from "@tanstack/react-router";
import { stores } from "@/lib/mock-data";
import { storeLogoUrl } from "@/components/store-card";

// Single wide "trust strip" banner — every store on Blinko in one place.
export function AllStoresBanner() {
  return (
    <section className="mt-14 overflow-hidden rounded-2xl bg-muted p-6 md:p-10">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
        All stores, one app
      </p>
      <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight text-foreground md:text-3xl">
        Every store you love, delivered from one app.
      </h2>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        {stores.length} stores across groceries, pharmacy, electronics, fashion and more — one
        basket, one delivery, one standard.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {stores.map((s) => (
          <Link
            key={s.id}
            to="/store/$slug"
            params={{ slug: s.slug }}
            title={s.name}
            className="grid size-14 shrink-0 place-items-center rounded-xl bg-surface p-2 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <img
              src={storeLogoUrl(s)}
              alt={s.name}
              loading="lazy"
              className="size-full object-contain"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
