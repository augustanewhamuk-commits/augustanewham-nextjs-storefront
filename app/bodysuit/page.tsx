import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { CategoryProducts } from "@/components/CategoryProducts";

export const metadata: Metadata = buildMetadata({
  title: "Bodysuit Collection",
  description:
    "Shop the Augusta Newham bodysuit collection — sleek, sculpting bodysuits in shades made for every skin tone.",
  path: "/bodysuit",
});

export default function BodysuitPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop Now", path: "/shop" },
            { name: "Bodysuit", path: "/bodysuit" },
          ]),
          pageSchema({
            type: "CollectionPage",
            name: "Bodysuit Collection",
            path: "/bodysuit",
            description:
              "Sleek, sculpting bodysuits in shades made for every skin tone.",
          }),
        ]}
      />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
        <header className="mb-10 max-w-2xl">
          <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
            Collection
          </p>
          <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-4xl">
            Bodysuit
          </h1>
          <p className="mt-4 font-body text-sm leading-relaxed text-brand-gray">
            Sleek, sculpting bodysuits in shades made for every skin tone.
          </p>
        </header>

        <CategoryProducts categoryPath="/bodysuit" />
      </main>
    </>
  );
}
