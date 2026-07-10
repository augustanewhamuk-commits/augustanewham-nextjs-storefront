import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageSchema } from "@/lib/structured-data";
import { BrandStoryJourney } from "@/components/BrandStoryJourney";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "About Augusta Newham — elegant underwear in high-quality fabrics that sit perfectly on the skin, accentuating curves and framing every figure, irrespective of body type.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about" },
          ]),
          pageSchema({
            type: "AboutPage",
            name: "About Us",
            path: "/about",
            description:
              "Elegant underwear in high-quality fabrics that sit perfectly on the skin, accentuating curves and framing every figure, irrespective of body type.",
          }),
        ]}
      />

      <main className="flex-1">
        {/* Hero — image bleeds to the section bottom on a backdrop that matches the photo */}
        <section className="bg-[#957a5f] text-brand-white">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-end md:gap-8 px-6 pt-10 sm:pt-12 lg:grid-cols-[1.5fr_1fr] lg:gap-12 lg:px-10 lg:pt-16">
            {/* Image — sits at the bottom so it bleeds to the section edge:
                below the text on mobile, left column on desktop. */}
            <div className="relative order-last mx-auto w-full max-w-[460px] lg:order-first lg:mx-0 lg:max-w-none">
              <Image
                src="/media/images/about/BA4A0049.png"
                alt="Two models wearing Augusta Newham bralettes and high waist briefs in nude and burgundy"
                width={1600}
                height={2400}
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="block h-auto w-full"
              />
            </div>

            {/* Intro */}
            <div className="order-first text-left lg:order-last lg:pb-28">
              <p className="font-body text-[13px] uppercase tracking-[0.3em] text-brand-white/70">
                Our Story
              </p>
              <h1 className="mt-5 font-wordmark text-4xl font-light uppercase leading-[1.06] tracking-[0.08em] sm:text-6xl sm:leading-[1.04] lg:text-7xl">
                About Augusta Newham
              </h1>
              <p className="mt-7 max-w-lg font-body text-lg leading-relaxed text-brand-white/90 sm:text-2xl">
                Augusta Newham features elegant underwear characterised with high
                quality fabrics that sleeps perfectly on the skin accentuating
                curves and framing every figure irrespective of the body type
              </p>
            </div>
          </div>
        </section>

        {/* Brand story — an animated, scroll-driven journey */}
        <section className="border-t border-brand-light-gray bg-brand-off-white">
          <div className="mx-auto w-full max-w-[1200px] px-6 py-20 lg:px-10 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
                Brand Story
              </p>
              <h2 className="mt-2 font-wordmark text-3xl font-light uppercase leading-tight tracking-[0.1em] text-brand-black sm:text-4xl">
                The Journey to a Perfect Base
              </h2>
            </div>

            <div className="mt-16 lg:mt-24">
              <BrandStoryJourney />
            </div>

            <p className="mt-16 text-center font-wordmark text-[13px] uppercase tracking-[0.15em] text-brand-black lg:mt-24">
              — {site.name}
            </p>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="mx-auto w-full max-w-[1200px] px-6 py-20 text-center lg:px-10 lg:py-24">
          <h2 className="font-wordmark text-2xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-3xl">
            Find Your Base
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-brand-gray">
            Pieces designed and developed for daily wear, covering every stage of
            a woman&apos;s life.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-brand-black px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-brand-black px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
