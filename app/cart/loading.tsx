import { PageHeaderSkeleton, Skeleton } from "@/components/Skeleton";

export default function CartLoading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
      <PageHeaderSkeleton />

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        {/* Line items */}
        <div className="divide-y divide-brand-light-gray border-y border-brand-light-gray">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-6 sm:gap-6">
              <Skeleton className="h-32 w-24 rounded-none sm:h-40 sm:w-32" />
              <div className="flex-1">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="mt-2 h-4 w-2/5" />
                <Skeleton className="mt-2 h-3 w-1/3" />
                <Skeleton className="mt-6 h-10 w-32 rounded-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border border-brand-light-gray p-6 sm:p-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-6 h-12 w-full rounded-none" />
        </div>
      </div>
    </main>
  );
}
