import { Skeleton } from "@/components/Skeleton";

export default function ProductLoading() {
  return (
    <main className="mx-auto w-full max-w-[1300px] flex-1 px-6 py-10 lg:px-10 lg:py-14">
      <Skeleton className="mb-8 h-3 w-64" />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="flex gap-3">
            <Skeleton className="aspect-[3/4] w-20 rounded-none" />
            <Skeleton className="aspect-[3/4] w-20 rounded-none" />
          </div>
        </div>

        {/* Info */}
        <div className="lg:py-2">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3 h-9 w-3/4" />
          <Skeleton className="mt-4 h-4 w-1/2" />
          <Skeleton className="mt-6 h-6 w-24" />

          <Skeleton className="mt-8 h-3 w-20" />
          <div className="mt-3 flex gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <Skeleton className="mt-7 h-3 w-12" />
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-12 rounded-none" />
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <Skeleton className="h-12 w-32 rounded-none" />
            <Skeleton className="h-12 flex-1 rounded-none" />
          </div>

          <div className="mt-10 space-y-2 border-t border-brand-light-gray pt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </main>
  );
}
