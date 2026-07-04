import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Plus, Minus } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { brands, categories, productColors, products } from "@/lib/mock-data";

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: search,
  component: Browse,
});

const PAGE_SIZE = 12;

function Browse() {
  const { category, q, page } = Route.useSearch();
  const currentPage = page ?? 1;
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<"latest" | "low" | "high" | "rating">("latest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [openCats, setOpenCats] = useState<string[]>([]);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const filtered = useMemo(() => {
    let out = products.slice();
    if (category) out = out.filter((p) => p.categoryId === category);
    if (q) {
      const needle = q.toLowerCase();
      out = out.filter(
        (p) => p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle),
      );
    }
    out = out.filter((p) => p.price >= priceMin && p.price <= priceMax);
    if (selectedBrands.length) out = out.filter((p) => selectedBrands.includes(p.brandId));
    if (selectedColors.length) out = out.filter((p) => p.color && selectedColors.includes(p.color));
    if (statusFilters.includes("in_stock")) out = out.filter((p) => p.inStock);
    if (statusFilters.includes("on_sale")) out = out.filter((p) => !!p.compareAtPrice);
    if (sort === "low") out.sort((a, b) => a.price - b.price);
    if (sort === "high") out.sort((a, b) => b.price - a.price);
    if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
    return out;
  }, [category, q, priceMin, priceMax, selectedBrands, selectedColors, statusFilters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeCategory = categories.find((c) => c.id === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className={activeCategory ? "" : "text-foreground"}>Shop</span>
        {activeCategory ? (
          <>
            <span>/</span>
            <span className="text-foreground">{activeCategory.name}</span>
          </>
        ) : null}
      </nav>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6 md:sticky md:top-24 md:self-start">
          {/* Price filter */}
          <FilterBlock title="Widget price filter">
            <div className="grid grid-cols-2 gap-2">
              <PriceInput label="Min price" value={priceMin} onChange={setPriceMin} />
              <PriceInput label="Max price" value={priceMax} onChange={setPriceMax} />
            </div>
            <div className="relative mt-4 h-1 rounded-full bg-border">
              <div
                className="absolute h-1 rounded-full bg-primary"
                style={{
                  left: `${(priceMin / 500) * 100}%`,
                  right: `${100 - (priceMax / 500) * 100}%`,
                }}
              />
              <input
                type="range" min={0} max={500} step={10} value={priceMin}
                onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                className="pointer-events-auto absolute -top-1 h-3 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
              <input
                type="range" min={0} max={500} step={10} value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                className="pointer-events-auto absolute -top-1 h-3 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs">
                Price:{" "}
                <span className="font-mono font-semibold">
                  ₹{priceMin} — ₹{priceMax}
                </span>
              </p>
              <button className="rounded bg-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-background">
                Filter
              </button>
            </div>
          </FilterBlock>

          {/* Product Categories */}
          <FilterBlock title="Product Categories">
            <ul className="space-y-1">
              {categories.map((c) => {
                const open = openCats.includes(c.id);
                const active = category === c.id;
                return (
                  <li key={c.id}>
                    <div
                      className={`flex items-center justify-between rounded-md py-1.5 text-sm ${
                        active ? "text-primary font-semibold" : ""
                      }`}
                    >
                      <Link to="/browse" search={{ category: c.id }} className="flex-1 hover:text-primary">
                        {c.name}
                      </Link>
                      <button
                        onClick={() => setOpenCats((s) => toggle(s, c.id))}
                        className="grid size-5 place-items-center rounded hover:bg-muted"
                        aria-label={open ? "Collapse" : "Expand"}
                      >
                        {open ? <Minus className="size-3" /> : <Plus className="size-3" />}
                      </button>
                    </div>
                    {open ? (
                      <p className="pl-3 pb-2 text-xs text-muted-foreground">{c.tagline}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </FilterBlock>

          {/* Colors */}
          <FilterBlock title="Filter by Color">
            <ul className="space-y-2">
              {productColors.map((c) => {
                const active = selectedColors.includes(c.id);
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedColors((s) => toggle(s, c.id))}
                      className="flex w-full items-center justify-between text-sm hover:text-primary"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-block size-4 rounded-full border ${
                            active ? "ring-2 ring-primary ring-offset-2" : "border-border"
                          }`}
                          style={{ backgroundColor: c.swatch }}
                        />
                        {c.name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">({c.count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </FilterBlock>

          {/* Brands */}
          <FilterBlock title="Filter by Brands">
            <ul className="space-y-2">
              {brands.map((b) => {
                const active = selectedBrands.includes(b.id);
                return (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => setSelectedBrands((s) => toggle(s, b.id))}
                        className="size-3.5 accent-primary"
                      />
                      {b.name}
                    </label>
                    <span className="font-mono text-[11px] text-muted-foreground">({b.count})</span>
                  </li>
                );
              })}
            </ul>
          </FilterBlock>

          {/* Status */}
          <FilterBlock title="Product Status">
            <ul className="space-y-2">
              {[
                { id: "in_stock", label: "In Stock" },
                { id: "on_sale", label: "On Sale" },
              ].map((s) => (
                <li key={s.id} className="text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(s.id)}
                      onChange={() => setStatusFilters((cur) => toggle(cur, s.id))}
                      className="size-3.5 accent-primary"
                    />
                    {s.label}
                  </label>
                </li>
              ))}
            </ul>
          </FilterBlock>
        </aside>

        {/* Right column */}
        <div>
          {/* Promo strip */}
          <div className="relative mb-4 overflow-hidden rounded-xl bg-muted p-6">
            <p className="text-xs font-medium text-sale">Only this week</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">
              Grocery store with different treasures
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              We have prepared special discounts for you on grocery products…
            </p>
            <Link
              to="/browse"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop now →
            </Link>
          </div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2 text-xs">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-mono font-semibold text-foreground">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-mono font-semibold text-foreground">{filtered.length}</span>{" "}
              results
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="latest">Sort by latest</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </label>
              <label className="hidden items-center gap-2 md:flex">
                <span className="text-muted-foreground">Show:</span>
                <span className="rounded-md border border-border bg-background px-2 py-1 font-mono">
                  {PAGE_SIZE} items
                </span>
              </label>
              <div className="inline-flex items-center overflow-hidden rounded-md border border-border">
                <button
                  onClick={() => setView("grid")}
                  className={`grid size-7 place-items-center ${view === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`grid size-7 place-items-center ${view === "list" ? "bg-primary text-primary-foreground" : ""}`}
                  aria-label="List view"
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          {pageItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
              No products match your filters.
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-3"
              }
            >
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-2">
              <PageBtn
                to="/browse"
                search={{ category, q, page: Math.max(1, currentPage - 1) }}
                disabled={currentPage === 1}
                icon
              >
                <ChevronLeft className="size-4" />
              </PageBtn>
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <PageBtn
                    key={p}
                    to="/browse"
                    search={{ category, q, page: p }}
                    active={p === currentPage}
                  >
                    {p}
                  </PageBtn>
                );
              })}
              <PageBtn
                to="/browse"
                search={{ category, q, page: Math.min(totalPages, currentPage + 1) }}
                disabled={currentPage === totalPages}
                icon
              >
                <ChevronRight className="size-4" />
              </PageBtn>
            </div>
          ) : null}

          {/* Recently viewed */}
          <section className="mt-14">
            <h3 className="mb-4 font-heading text-xl font-bold">Recently viewed items</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <ProductCard product={products[0]} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 border-b border-border pb-2 text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-8 rounded border border-border bg-background px-2 font-mono text-xs outline-none focus:border-primary"
      />
    </label>
  );
}

function PageBtn({
  children,
  to,
  search,
  active,
  disabled,
  icon,
}: {
  children: React.ReactNode;
  to: string;
  search: Record<string, unknown>;
  active?: boolean;
  disabled?: boolean;
  icon?: boolean;
}) {
  if (disabled) {
    return (
      <span className={`grid size-9 place-items-center rounded-md border border-border text-xs text-muted-foreground/50`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      to={to}
      search={search as { category?: string; q?: string; page?: number }}
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
