import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { ProductCard } from "@/components/ProductCard";
import { getCatalogCollection, getCatalogCollections } from "@/lib/catalog";
import { getCountryContext } from "@/lib/country";

export async function generateStaticParams() {
  const collections = await getCatalogCollections(20);
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCatalogCollection(handle);
  if (!collection) {
    return buildMetadata({
      title: "Not found",
      description: "",
      path: `/collections/${handle}`,
      index: false,
    });
  }

  return buildMetadata({
    title: `${collection.title} Collection`,
    description: collection.description,
    path: collection.path,
    image: collection.image?.url,
    imageAlt: collection.image?.altText,
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCatalogCollection(handle, await getCountryContext());
  if (!collection) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop Now", path: "/shop" },
            { name: collection.title, path: collection.path },
          ]),
          pageSchema({
            type: "CollectionPage",
            name: `${collection.title} Collection`,
            path: collection.path,
            description: collection.description,
          }),
        ]}
      />

      <main className="flex-1">
        {/* Banner — collection cover image with the title overlaid */}
        {collection.image ? (
          <section className="relative h-[36vh] min-h-[260px] w-full overflow-hidden sm:h-[44vh] lg:h-[60vh]">
            <Image
              src={collection.image.url}
              alt={collection.image.altText}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-brand-white">
              <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-white/80">
                Collection
              </p>
              <h1 className="mt-3 font-wordmark text-4xl font-light uppercase tracking-[0.12em] sm:text-5xl lg:text-6xl">
                {collection.title}
              </h1>
            </div>
          </section>
        ) : (
          <header className="mx-auto w-full max-w-[1400px] px-6 pt-16 lg:px-10 lg:pt-20">
            <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
              Collection
            </p>
            <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-4xl">
              {collection.title}
            </h1>
          </header>
        )}

        <div className="mx-auto w-full max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
          {collection.description ? (
            <p className="mb-10 max-w-2xl font-body text-sm leading-relaxed text-brand-gray">
              {collection.description}
            </p>
          ) : null}

          {collection.products.length === 0 ? (
            <div className="flex flex-col items-center gap-5 border border-brand-light-gray py-20 text-center">
              <p className="font-body text-sm text-brand-gray">
                New pieces are on the way.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-brand-black px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray"
              >
                Shop all
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {collection.products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
