import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { indexableRoutes } from "@/lib/routes";
import { getCatalog, getCatalogCollections } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Only list routes we actually want indexed — thin placeholder pages are
  // excluded (see `noindex` in lib/routes.ts) so they don't dilute crawling.
  const pages = indexableRoutes.map((route) => ({
    url: route.path === "/" ? site.url : `${site.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Live Shopify data so the sitemap matches the pages we actually render
  // (product/[slug] and collections/[handle] are driven by the catalog, not
  // the static prototype list). Mirrors their generateStaticParams.
  const [products, collections] = await Promise.all([
    getCatalog(),
    getCatalogCollections(20),
  ]);

  // Collection listing pages — these now drive the Shop nav.
  const collectionPages = collections.map((collection) => ({
    url: `${site.url}${collection.path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Each product detail page.
  const productPages = products.map((product) => ({
    url: `${site.url}/product/${product.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...pages, ...collectionPages, ...productPages];
}
