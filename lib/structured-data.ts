import { sameAs, site } from "./site";
import { navRoutes } from "./routes";
import type { Product } from "./products";

/** Absolute URL for a route path. */
export const abs = (path: string) =>
  path === "/" ? site.url : `${site.url}${path}`;

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

/** Organization — powers the Google knowledge panel / brand entity. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    // Logo as a sized ImageObject — Google prefers explicit dimensions for the
    // brand logo it shows in the knowledge panel / search result.
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/web-app-manifest-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${site.url}/web-app-manifest-512x512.png`,
    email: site.email,
    description: site.description,
    slogan: site.tagline,
    // Reinforces the brand entity for "every skin tone" / shapewear queries.
    knowsAbout: [
      "Lingerie",
      "Shapewear",
      "Bralettes",
      "Bodysuits",
      "High waist briefs",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.email,
      areaServed: "GB",
      availableLanguage: ["English"],
    },
    sameAs,
  };
}

/**
 * WebSite — the brand's site entity, tied to the Organization as publisher.
 *
 * Note: a `SearchAction` (Sitelinks search box) is intentionally NOT declared
 * yet — Google requires the target to perform a real on-site search, and
 * /shop has no search UI. Re-add `potentialAction` once search exists, e.g.:
 *   potentialAction: {
 *     "@type": "SearchAction",
 *     target: { "@type": "EntryPoint",
 *               urlTemplate: `${site.url}/shop?q={search_term_string}` },
 *     "query-input": "required name=search_term_string",
 *   }
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: site.url,
    inLanguage: site.language,
    publisher: { "@id": ORG_ID },
  };
}

/**
 * SiteNavigationElement nodes — describe the primary nav so Google understands
 * the site's main sections (a signal that helps it surface sitelinks). Returns
 * a flat array of nodes (spread into the JSON-LD graph in app/layout.tsx).
 */
export function siteNavigationSchema() {
  return navRoutes.map((route) => ({
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: route.label,
    url: abs(route.path),
  }));
}

/** Product node with an Offer — powers rich product results. */
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.variants
      .flatMap((variant) => variant.images)
      .map((img) => img.src)
      .filter((src): src is string => Boolean(src))
      .map((path) => `${site.url}${encodeURI(path)}`),
    sku: product.slug,
    category: product.category,
    brand: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      url: abs(`/product/${product.slug}`),
      price: product.price.toFixed(2),
      // Match the currency the price is actually in (Shopify localises it per
      // market via @inContext) so the amount and currency never disagree.
      priceCurrency: product.currencyCode,
      availability: "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
    },
  };
}

/** BreadcrumbList for a page's ancestry. */
export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

type PageType =
  | "WebPage"
  | "CollectionPage"
  | "ContactPage"
  | "AboutPage"
  | "FAQPage";

/** Generic page node, tied to the site graph. */
export function pageSchema({
  type = "WebPage",
  name,
  path,
  description,
}: {
  type?: PageType;
  name: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: abs(path),
    inLanguage: site.language,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
  };
}
