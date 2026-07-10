import {
  PageHeaderSkeleton,
  ProductGridSkeleton,
  Skeleton,
} from "@/components/Skeleton";

export default function ShopLoading() {
  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
      <PageHeaderSkeleton />
      <div className="flex items-center justify-between border-b border-brand-light-gray pb-5">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20" />
          ))}
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </main>
  );
}
