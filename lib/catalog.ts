/**
 * Storefront catalogue — adapts live Shopify products into the `Product` shape
 * the UI already speaks (lib/products.ts), so the cards, detail page and filters
 * are unchanged. Shopify drives title/price/images/variants/availability; brand
 * content (tagline, composition, care, details) comes from `custom.*` metafields
 * and swatch hex from the native option-value swatch — see
 * memory/shopify-headless-integration for the admin setup the client must do.
 *
 * Colour model: Shopify stores a flat Colour × Size variant matrix. We group it
 * back into the UI's "one entry per colour, each with its own sizes + images".
 *
 * TODO(launch): while products aren't yet published to the headless sales
 * channel the Storefront API returns nothing, so these helpers fall back to the
 * static prototype catalogue to keep the site rendering. Remove the fallback
 * once products are live.
 */
import {
  getProduct as getShopifyProduct,
  getProducts as getShopifyProducts,
  getCollections as getShopifyCollections,
  getCollection as getShopifyCollection,
  type ShopifyProduct,
  type ShopifyOption,
  type ShopifyCollection,
  type CountryCode,
} from "./shopify";
import {
  type Product,
  type ProductImage,
  type ProductVariant,
  // Static fallback — disabled for now (see getCatalog below):
  // products as staticProducts,
  // getProduct as getStaticProduct,
} from "./products";

/** Fallback swatch when an option value has no swatch colour set in admin. */
const DEFAULT_HEX = "#cfc7bd";

/**
 * Brand colour palette, keyed by the option-value name (lower-cased, spaces and
 * hyphens stripped). Shopify isn't carrying swatch hexes on its option values
 * yet, so we derive the swatch colour from the colour name. Once the client
 * sets native swatches in admin those win (see `toProduct`). Hexes mirror the
 * original static catalogue.
 */
const COLOR_HEX: Record<string, string> = {
  black: "#1a1a1a",
  chocolate: "#663300",
  brown: "#663300",
  darkbrown: "#663300",
  burgundy: "#800020",
  matcha: "#b9dca9",
  cream: "#fdfbd4",
  beige: "#edc9af",
  lightbeige: "#edc9af",
  darkbeige: "#a67b5b",
  dustybrown: "#666633",
  plum: "#660033",
  white: "#f5f5f0",
  nude: "#e8c9a8",
  tan: "#d2b48c",
};

/** Look up a swatch hex from a colour name, e.g. "Dark Beige" → "#a67b5b". */
const hexForColorName = (name: string): string | undefined =>
  COLOR_HEX[name.toLowerCase().replace(/[^a-z0-9]/g, "")];

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const findOption = (options: ShopifyOption[], re: RegExp) =>
  options.find((o) => re.test(o.name));

/** Parse a `list.single_line_text` metafield (a JSON array) into strings. */
function parseList(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Not JSON — treat the whole value as one item.
  }
  return value ? [value] : [];
}

/** Map a Shopify product onto the UI `Product` shape. */
export function toProduct(p: ShopifyProduct): Product {
  const colorOption = findOption(p.options, /colou?r/i);
  const sizeOption = findOption(p.options, /size/i);

  const valueOf = (variantOptions: { name: string; value: string }[], optName: string) =>
    variantOptions.find((o) => o.name === optName)?.value;

  const toImages = (urls: { url: string; altText: string | null }[]): ProductImage[] =>
    urls.map((img, i) => ({ view: img.altText || `${i + 1}`, src: img.url }));

  // Images for a set of variants, falling back to the product's gallery.
  const imagesFor = (variantsForColor: ShopifyProduct["variants"]): ProductImage[] => {
    const seen = new Set<string>();
    const picks: { url: string; altText: string | null }[] = [];
    for (const v of variantsForColor) {
      if (v.image && !seen.has(v.image.url)) {
        seen.add(v.image.url);
        picks.push(v.image);
      }
    }
    const gallery = picks.length ? picks : p.images;
    if (gallery.length) return toImages(gallery);
    return p.featuredImage ? toImages([p.featuredImage]) : [{ view: "1" }];
  };

  let variants: ProductVariant[];
  if (colorOption) {
    variants = colorOption.optionValues.map((cv) => {
      const matching = p.variants.filter(
        (v) => valueOf(v.selectedOptions, colorOption.name) === cv.name,
      );
      const sizes = sizeOption
        ? matching
            .map((v) => valueOf(v.selectedOptions, sizeOption.name))
            .filter((s): s is string => Boolean(s))
        : [];
      return {
        color: cv.name,
        // Native Shopify swatch wins; otherwise derive from the colour name.
        hex: cv.swatch?.color || hexForColorName(cv.name) || DEFAULT_HEX,
        images: imagesFor(matching),
        sizes: [...new Set(sizes)],
      };
    });
  } else {
    // No colour option: a single (label-less) variant carrying every size.
    const sizes = sizeOption?.optionValues.map((v) => v.name) ?? [];
    variants = [{ color: "", hex: DEFAULT_HEX, images: imagesFor(p.variants), sizes }];
  }

  const category = p.productType || "Shop";
  return {
    slug: p.handle,
    name: p.title,
    category,
    categoryPath: `/${slugify(category) || "shop"}`,
    price: Number(p.priceRange.minVariantPrice.amount),
    // Already localised by Shopify's @inContext(country:) — see lib/country.ts.
    currencyCode: p.priceRange.minVariantPrice.currencyCode,
    tagline: p.metafields.tagline ?? "",
    description: p.description,
    details: parseList(p.metafields.details),
    composition: p.metafields.composition ?? "",
    care: p.metafields.care ?? "",
    variants,
  };
}

/* ------------------------------------------------------------------ */
/* Fetchers (Shopify first, static prototype as a launch-time fallback)*/
/* ------------------------------------------------------------------ */

/**
 * Shopify appends "-copy" to a product's handle when it's duplicated in admin.
 * Guard against an accidental duplicate/test product leaking into the live
 * catalogue (and therefore the sitemap, nav and Google's index). The proper
 * fix is still to delete/unpublish it in Shopify — this is just a safety net.
 */
const isDuplicateHandle = (handle: string) => /-copy(-\d+)?$/.test(handle);

/**
 * All catalogue products, mapped from Shopify. Pass `country` (ISO alpha-2) to
 * localise prices to that market's currency via Shopify `@inContext`; omit it
 * for base-currency prices (e.g. the sitemap / static params, which don't render
 * money and shouldn't opt into dynamic rendering).
 */
export async function getCatalog(country?: CountryCode): Promise<Product[]> {
  const shopify = await getShopifyProducts(50, "CREATED_AT", country);
  return shopify
    .filter((p) => !isDuplicateHandle(p.handle))
    .map(toProduct);
  // Static fallback disabled — show a real empty state when Shopify has nothing.
  // To re-enable: return shopify.length ? shopify.map(toProduct) : staticProducts;
}

/** A single product by handle, mapped from Shopify. `country` localises prices. */
export async function getCatalogProduct(
  handle: string,
  country?: CountryCode,
): Promise<Product | null> {
  if (isDuplicateHandle(handle)) return null;
  const shopify = await getShopifyProduct(handle, country);
  return shopify ? toProduct(shopify) : null;
  // Static fallback disabled — to re-enable: return getStaticProduct(handle) ?? null;
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

/** A Shopify collection with its products mapped onto the UI `Product` shape. */
export type CatalogCollection = {
  handle: string;
  title: string;
  description: string;
  /** Collection cover image from Shopify admin (cdn.shopify.com), or null. */
  image: { url: string; altText: string } | null;
  /** Storefront URL for this collection's listing page. */
  path: string;
  products: Product[];
};

/** Shopify's auto-generated catch-all collection — never shown as a category. */
const HIDDEN_COLLECTION_HANDLES = new Set(["frontpage"]);

function toCatalogCollection(c: ShopifyCollection): CatalogCollection {
  return {
    handle: c.handle,
    title: c.title,
    description: c.description,
    image: c.image
      ? { url: c.image.url, altText: c.image.altText || c.title }
      : null,
    path: `/collections/${c.handle}`,
    products: c.products
      .filter((p) => !isDuplicateHandle(p.handle))
      .map(toProduct),
  };
}

/**
 * Storefront collections (real Shopify collections), capped at `max` and with
 * the automatic "frontpage" collection filtered out. Drives the nav dropdown
 * and the homepage "Find your base" grid.
 */
export async function getCatalogCollections(max = 4): Promise<CatalogCollection[]> {
  const collections = await getShopifyCollections(max + HIDDEN_COLLECTION_HANDLES.size);
  return collections
    .filter((c) => !HIDDEN_COLLECTION_HANDLES.has(c.handle))
    .slice(0, max)
    .map(toCatalogCollection);
}

/**
 * A single collection by handle, with its products. Null if not found.
 * `country` localises the products' prices via Shopify `@inContext`.
 */
export async function getCatalogCollection(
  handle: string,
  country?: CountryCode,
): Promise<CatalogCollection | null> {
  const collection = await getShopifyCollection(handle, 30, country);
  return collection ? toCatalogCollection(collection) : null;
}
