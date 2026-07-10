import { PageHeaderSkeleton, Skeleton } from "@/components/Skeleton";

export default function AccountLoading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
      <PageHeaderSkeleton />

      <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
        {/* Section nav */}
        <div className="flex gap-3 lg:flex-col lg:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-28" />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-6 border border-brand-light-gray p-6 sm:grid-cols-2 sm:p-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            ))}
          </div>
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 w-full rounded-none" />
            <Skeleton className="h-40 w-full rounded-none" />
          </div>
        </div>
      </div>
    </main>
  );
}
