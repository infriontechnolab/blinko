import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { PromoBannerRow } from "@/components/promo-banner-row";
import { PromoMosaic } from "@/components/promo-mosaic";
import { HomeCategoryRail } from "@/components/home-category-rail";
import { AllStoresBanner } from "@/components/all-stores-banner";
import { StoreGrid } from "@/components/store-grid";
import { useCategoriesPanel } from "@/lib/categories-panel";
import { stores, storeCategories } from "@/lib/mock-data";
import { BRAND } from "@/lib/brand";

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: search,
  component: Index,
});

const PAGE_SIZE = 8;

function Index() {
  const { open: catsOpen } = useCategoriesPanel();
  const { category, q, page } = Route.useSearch();
  const currentPage = page ?? 1;

  const featuredStores = useMemo(() => stores.filter((v) => v.isFeatured), []);

  const filteredStores = useMemo(() => {
    let out = stores.slice();
    if (category) out = out.filter((v) => v.categoryId === category);
    if (q) {
      const needle = q.toLowerCase();
      out = out.filter(
        (v) => v.name.toLowerCase().includes(needle) || v.tagline.toLowerCase().includes(needle),
      );
    }
    return out;
  }, [category, q]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const pageItems = filteredStores.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeCategory = storeCategories.find((c) => c.id === category);
  const isFiltering = Boolean(category || q);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      {/* Hero: category rail + wide banner */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          catsOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-1"
        }`}
      >
        {catsOpen ? (
          <aside id="home-categories-panel" className="hidden lg:block">
            <HomeCategoryRail />
          </aside>
        ) : null}
        <HeroCarousel />
      </div>

      {/* Marketing sections — hidden while filtering so the result is front-and-center */}
      {!isFiltering ? (
        <>
          {/* All-stores banner strip */}
          <AllStoresBanner />

          {/* Three wide promo banners */}
          <PromoBannerRow />

          {/* Featured Stores */}
          {featuredStores.length > 0 ? (
            <section className="mt-14">
              <div className="mb-6">
                <h2 className="text-2xl font-bold md:text-3xl">Featured stores</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Top-rated stores, handpicked for you this week.
                </p>
              </div>
              <StoreGrid stores={featuredStores} />
            </section>
          ) : null}

          {/* Four tall promo banners */}
          <PromoMosaic />
        </>
      ) : null}

      {/* All Stores — filterable, paginated */}
      <section id="all-stores" className="mt-14 scroll-mt-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              {activeCategory ? activeCategory.name : "All stores"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isFiltering
                ? `${filteredStores.length} ${filteredStores.length === 1 ? "store" : "stores"} found`
                : `Browse every store on ${BRAND.name}, from groceries to gadgets.`}
            </p>
          </div>
        </div>

        {/* Category pill filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/"
            search={{ q }}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:border-primary hover:text-primary"
            }`}
          >
            All
          </Link>
          {storeCategories.map((c) => (
            <Link
              key={c.id}
              to="/"
              search={{ category: c.id, q }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:border-primary hover:text-primary"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {pageItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
            No stores match{activeCategory ? ` ${activeCategory.name}` : ""}
            {q ? ` “${q}”` : ""}.
          </div>
        ) : (
          <StoreGrid stores={pageItems} />
        )}

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            <PageBtn
              search={{ category, q, page: Math.max(1, currentPage - 1) }}
              disabled={currentPage === 1}
              icon
            >
              <ChevronLeft className="size-4" />
            </PageBtn>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <PageBtn key={p} search={{ category, q, page: p }} active={p === currentPage}>
                  {p}
                </PageBtn>
              );
            })}
            <PageBtn
              search={{ category, q, page: Math.min(totalPages, currentPage + 1) }}
              disabled={currentPage === totalPages}
              icon
            >
              <ChevronRight className="size-4" />
            </PageBtn>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function PageBtn({
  children,
  search,
  active,
  disabled,
  icon,
}: {
  children: React.ReactNode;
  search: { category?: string; q?: string; page?: number };
  active?: boolean;
  disabled?: boolean;
  icon?: boolean;
}) {
  if (disabled) {
    return (
      <span className="grid size-9 place-items-center rounded-md border border-border text-xs text-muted-foreground/50">
        {children}
      </span>
    );
  }
  return (
    <Link
      to="/"
      search={search}
      className={`grid size-9 place-items-center rounded-md border text-xs font-semibold ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface hover:border-primary hover:text-primary"
      } ${icon ? "px-2" : ""}`}
    >
      {children}
    </Link>
  );
}
