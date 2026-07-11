// Loading placeholders — shown during route transitions on slow connections.

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-28 w-full animate-pulse bg-muted" />
      <div className="space-y-2 p-4 pt-10">
        <div className="mx-auto h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-full animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function StoreGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StoreCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StoreDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      <div className="mb-6 h-3 w-48 animate-pulse rounded bg-muted" />
      <div className="h-40 w-full animate-pulse rounded-3xl bg-muted" />
      <div className="mt-8 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:py-10">
      <div className="mb-6 h-3 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="aspect-square w-full animate-pulse rounded-3xl bg-muted" />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-5">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-20 w-full animate-pulse rounded bg-muted" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
