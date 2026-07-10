import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/structured-data";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { cardImage } from "@/lib/products";
import { getCatalog, getCatalogProduct } from "@/lib/catalog";
import { getCountryContext } from "@/lib/country";

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) return buildMetadata({ title: "Not found", description: "", path: `/product/${slug}`, index: false });

  return buildMetadata({
    title: product.name,
    description: product.description,
    path: `/product/${product.slug}`,
    image: cardImage(product),
    imageAlt: `${product.name} — ${product.variants[0]?.color ?? ""}`.trim(),
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = await getCountryContext();
  const product = await getCatalogProduct(slug, country);
  if (!product) notFound();

  const related = (await getCatalog(country)).filter(
    (p) => p.categoryPath === product.categoryPath && p.slug !== product.slug,
  );

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop Now", path: "/shop" },
            { name: product.category, path: product.categoryPath },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
          productSchema(product),
        ]}
      />

      <main className="mx-auto w-full max-w-[1300px] flex-1 px-6 py-10 lg:px-10 lg:py-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 font-body text-[12px] uppercase tracking-[0.08em] text-brand-gray"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/shop" className="transition-colors hover:text-brand-black">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={product.categoryPath}
                className="transition-colors hover:text-brand-black"
              >
                {product.category}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-brand-black">{product.name}</li>
          </ol>
        </nav>

        <ProductDetail product={product} />

        {/* Related */}
        {related.length > 0 ? (
          <section className="mt-20 border-t border-brand-light-gray pt-12 lg:mt-28">
            <h2 className="font-wordmark text-2xl font-light uppercase tracking-[0.1em] text-brand-black">
              You may also like
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
