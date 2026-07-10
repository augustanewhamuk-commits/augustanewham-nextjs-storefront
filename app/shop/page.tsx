import type { Metadata } from "next";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { ShopListing } from "@/components/ShopListing";
import { getCatalog } from "@/lib/catalog";
import { getCountryContext } from "@/lib/country";

export const metadata: Metadata = buildMetadata({
  title: "Shop All",
  description:
    "Shop all Augusta Newham lingerie and shapewear — bralettes, bodysuits, shapewear and high waist briefs in shades for every skin tone.",
  path: "/shop",
});

export default async function ShopPage() {
  const products = await getCatalog(await getCountryContext());

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop Now", path: "/shop" },
          ]),
          pageSchema({
            type: "CollectionPage",
            name: "Shop All",
            path: "/shop",
            description:
              "All Augusta Newham lingerie and shapewear in one place.",
          }),
        ]}
      />

      <main className="flex-1">
        {/* Banner — full-bleed cover image with the page title overlaid */}
        <section className="relative h-[40vh] min-h-[280px] w-full overflow-hidden sm:h-[50vh] lg:h-[88vh]">
          <Image
            src="/media/images/shop/shop-cover.jpeg"
            alt="Augusta Newham lingerie and shapewear collection"
            fill
            priority
            sizes="80vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-brand-white">
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-white/80">
              Shop
            </p>
            <h1 className="mt-3 font-wordmark text-4xl font-light uppercase tracking-[0.12em] sm:text-5xl lg:text-6xl">
              Shop All
            </h1>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
          <ShopListing products={products} />
        </div>
      </main>
    </>
  );
}
