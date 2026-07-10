import { ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

export default function CollectionLoading() {
  return (
    <main className="flex-1">
      {/* Banner placeholder — matches the collection cover image */}
      <Skeleton className="h-[36vh] min-h-[260px] w-full rounded-none sm:h-[44vh] lg:h-[60vh]" />

      <div className="mx-auto w-full max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
        <Skeleton className="mb-10 h-4 w-2/3 max-w-xl" />
        <ProductGridSkeleton count={4} />
      </div>
    </main>
  );
}
