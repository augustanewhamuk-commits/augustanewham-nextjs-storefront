/**
 * Skeleton placeholders shown via route-level loading.tsx while a page's
 * content streams in. Plain (server-renderable) components — no client JS.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-brand-light-gray ${className}`}
    />
  );
}

/** A single product tile placeholder (image + two text lines). */
export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <Skeleton className="mt-3 h-2.5 w-1/3" />
      <Skeleton className="mt-2 h-3 w-3/4" />
    </div>
  );
}

/** A responsive grid of product placeholders. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Page heading placeholder (eyebrow + title). */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-10">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="mt-3 h-8 w-56" />
    </div>
  );
}
