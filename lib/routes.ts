import type { MetadataRoute } from "next";

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

export type AppRoute = {
  path: string;
  /** Human label used for nav, breadcrumbs and SiteNavigation schema. */
  label: string;
  /** Shown in the primary header navigation (README §10). */
  inNav: boolean;
  /** Shown in the footer link list (README §5.2). */
  inFooter: boolean;
  /**
   * Keep this route out of the index (and the sitemap) for now. Used for thin
   * "coming soon" pages that would dilute crawl quality until real content
   * lands — flip back to indexable by removing this flag.
   */
  noindex?: boolean;
  priority: number;
  changeFrequency: ChangeFrequency;
  /**
   * Representative photo for this page's Open Graph / social share image.
   * When omitted, the page falls back to a branded text card generated at
   * /api/og (see lib/seo.ts).
   */
  ogImage?: string;
};

/**
 * Every route in the site. Single source of truth consumed by the sitemap,
 * the SiteNavigation structured data, and (later) the Header/Footer.
 */
export const routes: AppRoute[] = [
  { path: "/", label: "Home", inNav: true, inFooter: false, priority: 1.0, changeFrequency: "weekly", ogImage: "/media/images/homepage/vlcsnap-2026-06-21-15h58m40s674.png" },
  // Category pages kept out of the primary nav: the Shop dropdown now renders
  // live Shopify collections (→ /collections/{handle}) instead. These static
  // routes remain reachable/indexable for now.
  { path: "/bralette", label: "Bralette", inNav: false, inFooter: false, noindex: true, priority: 0.9, changeFrequency: "weekly", ogImage: "/media/images/products/bralette/burgundy/front.jpg" },
  { path: "/shapewear", label: "Shapewear", inNav: false, inFooter: false, noindex: true, priority: 0.9, changeFrequency: "weekly", ogImage: "/media/images/products/shapewear/full-body-shapewear/black/front.jpg" },
  { path: "/bodysuit", label: "Bodysuit", inNav: false, inFooter: false, priority: 0.9, changeFrequency: "weekly", ogImage: "/media/images/products/bodysuit/beige/front.jpg" },
  { path: "/high-waist-brief", label: "High Waist Brief", inNav: false, inFooter: false, priority: 0.9, changeFrequency: "weekly", ogImage: "/media/images/products/highwaist-brief/matcha/side.jpg" },
  { path: "/size-guide", label: "Size Guide", inNav: true, inFooter: false, priority: 0.6, changeFrequency: "monthly" },
  { path: "/shop", label: "Shop Now", inNav: true, inFooter: false, priority: 0.9, changeFrequency: "weekly", ogImage: "/media/images/shop/shop-cover.jpeg" },
  { path: "/contact", label: "Contact Us", inNav: true, inFooter: false, priority: 0.6, changeFrequency: "monthly" },
  // Footer / legal pages (README §5.2)
  { path: "/about", label: "About Us", inNav: false, inFooter: true, priority: 0.5, changeFrequency: "yearly" },
  { path: "/faq", label: "FAQ", inNav: false, inFooter: true, priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", label: "Terms of Service", inNav: false, inFooter: true, priority: 0.3, changeFrequency: "yearly" },
  { path: "/returns-refund-shipping", label: "Returns, Refund and Shipping Policy", inNav: false, inFooter: true, priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-cookies", label: "Privacy Policy", inNav: false, inFooter: true, priority: 0.3, changeFrequency: "yearly" },
];

export const navRoutes = routes.filter((r) => r.inNav);
export const footerRoutes = routes.filter((r) => r.inFooter);
/** Routes Google should index — drives the sitemap and per-page robots. */
export const indexableRoutes = routes.filter((r) => !r.noindex);

/** Look up a route by its path (used to derive per-page SEO defaults). */
export const findRoute = (path: string) =>
  routes.find((r) => r.path === path);

/** Sub-links revealed by the "Shop Now" dropdown (README §10). */
const shopCategoryOrder = [
  "/bralette",
  "/bodysuit",
  "/high-waist-brief",
  "/shapewear",
];
export const shopCategories = shopCategoryOrder
  .map((path) => routes.find((r) => r.path === path))
  .filter((r): r is AppRoute => Boolean(r));
