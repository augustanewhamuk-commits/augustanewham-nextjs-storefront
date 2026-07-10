import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { SizeGuideTabs } from "@/components/SizeGuideTabs";

export const metadata: Metadata = buildMetadata({
  title: "Size Guide",
  description:
    "Augusta Newham size guide — measurements for bralettes, shapewear, bodysuits and high waist briefs to help you find your perfect fit.",
  path: "/size-guide",
});

const measuringTips = [
  {
    term: "Bust",
    desc: "Measure around the fullest part of your bust, keeping the tape level and snug — not tight.",
  },
  {
    term: "Waist",
    desc: "Measure around the narrowest part of your natural waistline, usually just above the navel.",
  },
  {
    term: "Hip",
    desc: "Stand with feet together and measure around the fullest part of your hips and seat.",
  },
];

export default function SizeGuidePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Size Guide", path: "/size-guide" },
          ]),
          pageSchema({
            name: "Size Guide",
            path: "/size-guide",
            description:
              "Measurements for bralettes, shapewear, bodysuits and high waist briefs.",
          }),
        ]}
      />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
        {/* Heading */}
        <header className="mb-12 max-w-2xl">
          <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
            Help
          </p>
          <h1 className="mt-3 font-wordmark text-3xl font-light uppercase tracking-[0.15em] text-brand-black sm:text-4xl">
            Size Guide
          </h1>
          <p className="mt-4 font-body text-sm leading-relaxed text-brand-gray">
            Find your perfect fit. All measurements are body measurements in
            inches — if you fall between two sizes, we recommend sizing up for
            comfort. Still unsure? Reach out and we&apos;ll help you choose.
          </p>
        </header>

        {/* How to measure */}
        <section className="mb-14 border-y border-brand-light-gray py-8">
          <h2 className="font-wordmark text-base uppercase tracking-[0.12em] text-brand-black">
            How to Measure
          </h2>
          <dl className="mt-5 grid gap-6 sm:grid-cols-3">
            {measuringTips.map((tip) => (
              <div key={tip.term}>
                <dt className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-brand-black">
                  {tip.term}
                </dt>
                <dd className="mt-1.5 font-body text-sm leading-relaxed text-brand-gray">
                  {tip.desc}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Charts (tabbed) + export */}
        <SizeGuideTabs />

        <p className="mt-12 font-body text-xs leading-relaxed text-brand-gray print:hidden">
          Measurements are a guide only and may vary slightly by style and
          fabric stretch. For help finding your size, please{" "}
          <a
            href="/contact"
            className="text-brand-black underline decoration-1 underline-offset-2 transition-colors hover:text-brand-gray"
          >
            contact us
          </a>
          .
        </p>
      </main>
    </>
  );
}
