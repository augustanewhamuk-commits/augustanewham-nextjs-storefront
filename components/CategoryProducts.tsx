import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { getCountryContext } from "@/lib/country";
import { ProductCard } from "./ProductCard";

/**
 * Product grid for a single category (used by the category pages). Reads the live
 * Shopify catalogue localised to the visitor's market so prices/currency match
 * the rest of the site, filtered to this category.
 */
export async function CategoryProducts({ categoryPath }: { categoryPath: string }) {
  const items = (await getCatalog(await getCountryContext())).filter(
    (product) => product.categoryPath === categoryPath,
  );

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
