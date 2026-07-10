import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { CategoryProducts } from "@/components/CategoryProducts";

export const metadata: Metadata = buildMetadata({
  title: "Shapewear Collection",
  description:
    "Shop the Augusta Newham shapewear collection — full and removable-strap shaping bodysuits in an inclusive size range.",
  path: "/shapewear",
});

export default function ShapewearPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop Now", path: "/shop" },
            { name: "Shapewear", path: "/shapewear" },
          ]),
          pageSchema({
            type: "CollectionPage",
            name: "Shapewear Collection",
            path: "/shapewear",
            description:
              "Full and removable-strap shaping bodysuits in an inclusive size range.",
          }),
        ]}
      />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
        <header className="mb-10 max-w-2xl">
          <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
            Collection
          </p>
          <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-4xl">
            Shapewear
          </h1>
          <p className="mt-4 font-body text-sm leading-relaxed text-brand-gray">
            Full and removable-strap shaping bodysuits in an inclusive size
            range.
          </p>
        </header>

        <CategoryProducts categoryPath="/shapewear" />
      </main>
    </>
  );
}
