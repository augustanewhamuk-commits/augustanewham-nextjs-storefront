import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/structured-data";
import { FaqAccordion, faqSchema } from "@/components/FaqAccordion";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description:
    "Frequently asked questions about Augusta Newham — ordering, order status, cancellations, returns and shipping.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          faqSchema,
        ]}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 lg:py-20">
        <header className="mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
            Support
          </p>
          <h1 className="mt-3 font-wordmark text-3xl font-light uppercase tracking-[0.15em] text-brand-black sm:text-4xl">
            Frequently Asked Questions
          </h1>
        </header>

        <FaqAccordion />
      </main>
    </>
  );
}
