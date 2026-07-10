import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { CategoryProducts } from "@/components/CategoryProducts";

export const metadata: Metadata = buildMetadata({
  title: "High Waist Brief Collection",
  description:
    "Shop the Augusta Newham high waist brief collection — smoothing high-waisted briefs in shades made for every skin tone.",
  path: "/high-waist-brief",
});

export default function HighWaistBriefPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop Now", path: "/shop" },
            { name: "High Waist Brief", path: "/high-waist-brief" },
          ]),
          pageSchema({
            type: "CollectionPage",
            name: "High Waist Brief Collection",
            path: "/high-waist-brief",
            description:
              "Smoothing high-waisted briefs in shades made for every skin tone.",
          }),
        ]}
      />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
        <header className="mb-10 max-w-2xl">
          <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
            Collection
          </p>
          <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-4xl">
            High Waist Brief
          </h1>
          <p className="mt-4 font-body text-sm leading-relaxed text-brand-gray">
            Smoothing high-waisted briefs in shades made for every skin tone.
          </p>
        </header>

        <CategoryProducts categoryPath="/high-waist-brief" />
      </main>
    </>
  );
}
