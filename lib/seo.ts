import type { Metadata } from "next";
import { site } from "./site";
import { findRoute } from "./routes";

type PageSeoInput = {
  title: string;
  description: string;
  /** Route path, e.g. "/bralette" or "/". Used for the canonical URL. */
  path: string;
  /**
   * Force indexability. When omitted, it's derived from the route's `noindex`
   * flag in lib/routes.ts so the sitemap and page robots never drift apart.
   */
  index?: boolean;
  /**
   * Open Graph / Twitter share image. When omitted, falls back to the route's
   * `ogImage` (lib/routes.ts) and finally a branded card generated at /api/og.
   * Pass an explicit path for dynamic pages (e.g. product photos).
   */
  image?: string;
  /** Alt text for the share image. Defaults to the page title. */
  imageAlt?: string;
};

/** Branded fallback card endpoint for pages with no representative photo. */
function brandedCard(title: string): string {
  return `/api/og?title=${encodeURIComponent(title)}`;
}

/**
 * Builds a complete per-page Metadata object: canonical URL, Open Graph and
 * Twitter cards, all inheriting the global defaults set in app/layout.tsx.
 */
export function buildMetadata({
  title,
  description,
  path,
  index,
  image,
  imageAlt,
}: PageSeoInput): Metadata {
  const canonical = path === "/" ? "/" : path;
  const route = findRoute(path);
  // Explicit `index` wins; otherwise honour the route's noindex flag.
  const shouldIndex = index ?? !route?.noindex;

  // Image precedence: explicit arg → route's photo → branded card.
  const ogImage = image ?? route?.ogImage ?? brandedCard(title);
  const alt = imageAlt ?? title;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: canonical,
      title,
      description,
      images: [{ url: ogImage, alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: shouldIndex
      ? undefined // inherit indexable defaults from the root layout
      : { index: false, follow: true },
  };
}
