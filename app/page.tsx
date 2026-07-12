import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { pageSchema } from "@/lib/structured-data";
import { Reveal } from "@/components/Reveal";
import { ShadeRange } from "@/components/ShadeRange";
import { SizeRange } from "@/components/SizeRange";
import { ProductCard } from "@/components/ProductCard";
import { FindYourBase } from "@/components/FindYourBase";
import { getCatalog, getCatalogCollections } from "@/lib/catalog";
import { getCountryContext } from "@/lib/country";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
});

export default async function Home() {
  // Live Shopify collections (with their cover images) drive "Find your base";
  // real products drive "The Base Edit".
  const collections = await getCatalogCollections(4);
  const categories = collections.map((c) => ({
    label: c.title,
    href: c.path,
    cover: c.image?.url,
    swatches: [],
  }));
  const baseEdit = (await getCatalog(await getCountryContext())).slice(0, 4);

  return (
    <>
      <JsonLd
        data={pageSchema({
          name: `${site.name} — ${site.tagline}`,
          path: "/",
          description: site.description,
        })}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-[86vh] items-end overflow-hidden">
          {/* Fallback stills shown until the video renders its first frame */}
          <img
            src="/media/images/homepage/vlcsnap-2026-06-21-15h58m40s674.png"
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover object-top lg:block"
            aria-hidden="true"
          />
          <img
            src="/media/videos/homepage/home-placehoolder.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top lg:hidden"
            aria-hidden="true"
          />
          <video
            className="absolute inset-0 h-full w-full object-cover object-top"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source
              media="(min-width: 1024px)"
              src="/media/videos/homepage/about-hero-video-.8-new.webm"
              type="video/mp4"
            />
            <source
              media="(max-width: 1023.98px)"
              src="/media/videos/homepage/homepage-video-mobile.webm"
              type="video/mp4"
            />
          </video>
          <div
            className="absolute inset-0 bg-gradient-to-t from-brand-black/75 via-brand-black/20 to-brand-black/10"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-8 text-brand-white lg:px-20 lg:pb-20">
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-white/75">
              {site.tagline}
            </p>
            <h1 className="lg:mt-4 mt-2 max-w-3xl font-wordmark text-[1.8rem] font-light uppercase leading-[1.05] tracking-[0.06em] sm:text-6xl sm:leading-[1.02] lg:text-7xl">
              A perfect base
              <span className="block text-brand-white/80">for every body</span>
            </h1>
            <p className="lg:mt-6 mt-2 max-w-md font-body text-base leading-relaxed text-brand-white/85">
              Underwear made to sit perfectly on the skin — shaped for every
              figure, in shades for every skin tone.
            </p>
            <div className="lg:mt-8 mt-4 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-brand-white px-6 py-2.5 font-wordmark text-[10px] uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-white/85 sm:px-8 sm:py-3 sm:text-[12px]"
              >
                Shop the collection
              </Link>
              <Link
                href="/shapewear"
                className="inline-flex items-center justify-center border border-brand-white/70 px-6 py-2.5 font-wordmark text-[10px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-white hover:text-brand-black sm:px-8 sm:py-3 sm:text-[12px]"
              >
                Explore shapewear
              </Link>
            </div>
          </div>
        </section>

        {/* Shop by category */}
        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-20 lg:py-28">
          <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-gray">
                Shop
              </p>
              <h2 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.08em] text-brand-black sm:text-4xl">
                Find your base
              </h2>
            </div>
            <Link
              href="/shop"
              className="font-body text-[12px] uppercase tracking-[0.14em] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
            >
              View all
            </Link>
          </Reveal>

          <FindYourBase categories={categories} />
        </section>

        {/* The Base Edit — shoppable featured products */}
        <section className="bg-brand-off-white">
          <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-10 lg:py-28">
            <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-gray">
                  Shop
                </p>
                <h2 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.08em] text-brand-black sm:text-4xl">
                  The Base Edit
                </h2>
              </div>
              <Link
                href="/shop"
                className="font-body text-[12px] uppercase tracking-[0.14em] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
              >
                View all
              </Link>
            </Reveal>

            <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:gap-x-4 lg:overflow-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {baseEdit.map((product) => (
                <div
                  key={product.slug}
                  className="w-[62%] shrink-0 snap-start sm:w-[40%] lg:w-auto"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Shade Range — the brand thesis, made visible */}
        {/* <ShadeRange /> */}

        {/* Story teaser */}
        <section className="bg-brand-off-white">
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
            <Reveal>
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-light-gray">
                <Image
                  src="/media/images/homepage/WhatsApp Image 2026-05-13 at 22.17.36.png"
                  alt="Augusta Newham shapewear worn against the skin"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-gray">
                Our Story
              </p>
              <h2 className="mt-3 font-wordmark text-3xl font-light uppercase leading-[1.1] tracking-[0.08em] text-brand-black sm:text-4xl">
                The base is what
                <br />
                you wear first
              </h2>
              <p className="mt-6 max-w-md font-body text-base leading-relaxed text-brand-gray">
                Augusta Newham began with a simple idea — a base that fits real
                bodies, at every size and every stage of life. Comfort first,
                confidence always.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 font-wordmark text-[12px] uppercase tracking-[0.14em] text-brand-black transition-colors hover:text-brand-gray"
              >
                Read our story
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Inclusive sizing — XXS to 7XL */}
        <SizeRange />
      </main>
    </>
  );
}
