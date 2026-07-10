import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/Skeleton";

export default function CategoryLoading() {
  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
      <PageHeaderSkeleton />
      <ProductGridSkeleton count={4} />
    </main>
  );
}
