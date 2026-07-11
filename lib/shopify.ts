/**
 * Minimal Shopify Storefront API client.
 *
 * Server-side only: reads STOREFRONT_ACCESS_TOKEN (not NEXT_PUBLIC_*) so the
 * token never ships in the browser bundle. The Storefront token is public-safe,
 * but keeping calls on the server avoids leaking it and keeps CORS simple.
 *
 * Env (see .env.local):
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN  e.g. https://iby1ui-j5.myshopify.com
 *   SHOPIFY_STOREFRONT_API_VERSION    e.g. 2025-01
 *   STOREFRONT_ACCESS_TOKEN           the Storefront API access token
 */

const RAW_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const TOKEN = process.env.STOREFRONT_ACCESS_TOKEN ?? "";

/** Normalise the domain into a full GraphQL endpoint (accepts bare host or URL). */
function endpoint(): string {
  const host = RAW_DOMAIN.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${host}/api/${API_VERSION}/graphql.json`;
}

export type ShopifyFetchResult<T> = { data: T };

/**
 * An ISO 3166-1 alpha-2 country code (e.g. "GB", "US") passed to Shopify's
 * `@inContext(country:)` directive to localise prices to a market's presentment
 * currency. Typed loosely as string — Shopify validates it against the
 * `CountryCode` enum server-side and errors on an unknown code.
 */
export type CountryCode = string;

/**
 * Run a Storefront GraphQL query. Throws on transport or GraphQL errors so
 * callers can handle them (or let them surface). `revalidate` controls Next's
 * data cache (seconds); pass 0 to opt out.
 */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 60,
  withToken = true,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // Product/collection reads run tokenless: the custom-app token's sales channel
  // has no products published to it, so sending it returns an empty list. The
  // store's default storefront serves the catalogue tokenless. Customer auth (and,
  // later, metafields) still need the token, so those callers keep withToken=true.
  if (withToken) {
    if (!TOKEN) throw new Error("STOREFRONT_ACCESS_TOKEN is not set");
    headers["X-Shopify-Storefront-Access-Token"] = TOKEN;
  }

  const res = await fetch(endpoint(), {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(
      `Shopify Storefront API errors: ${json.errors
        .map((e) => e.message)
        .join("; ")}`,
    );
  }

  if (!json.data) {
    throw new Error("Shopify Storefront API returned no data");
  }

  return json.data;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export type Money = { amount: string; currencyCode: string };

export type ShopifyImage = { url: string; altText: string | null };

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  /** Selected option values, e.g. [{name:"Color",value:"Black"},{name:"Size",value:"M"}]. */
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
};

/** A product option value, e.g. {name:"Black", swatch:{color:"#1a1a1a"}}. */
export type ShopifyOptionValue = {
  name: string;
  /** Native Shopify swatch — `color` is the hex set on the option value in admin. */
  swatch: { color: string | null } | null;
};

export type ShopifyOption = { name: string; optionValues: ShopifyOptionValue[] };

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  /** Shopify product type — category fallback when the product has no collection. */
  productType: string;
  /** Collections this product belongs to — the first real one drives the breadcrumb category. */
  collections: { handle: string; title: string }[];
  /** Product-level options, e.g. [{name:"Colour",optionValues:[…]},{name:"Size",…}]. */
  options: ShopifyOption[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  /** Brand content from `custom.*` metafields, keyed by metafield key. */
  metafields: Record<string, string>;
};

/**
 * Product-level metafields the storefront would read (namespace `custom`).
 * DISABLED while we run tokenless: metafields need `unauthenticated_read_metafields`,
 * which requires the Storefront token — and sending the token returns no products
 * (wrong sales channel). Re-add this to PRODUCT_FRAGMENT + pass withToken=true once
 * products are published to the token's channel. See memory/shopify-headless-integration.
 */
// const PRODUCT_METAFIELDS = `
//   metafields(identifiers: [
//     { namespace: "custom", key: "tagline" }
//     { namespace: "custom", key: "composition" }
//     { namespace: "custom", key: "care" }
//     { namespace: "custom", key: "details" }
//   ]) { key value }
// `;

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    collections(first: 3) { edges { node { handle title } } }
    options {
      name
      optionValues { name swatch { color } }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    featuredImage { url altText }
    images(first: 20) { edges { node { url altText } } }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
          image { url altText }
        }
      }
    }
  }
`;

type RawProduct = Omit<ShopifyProduct, "images" | "variants" | "metafields" | "collections"> & {
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyVariant }[] };
  collections: { edges: { node: { handle: string; title: string } }[] };
  /** Only present when fetched withToken — disabled while tokenless. */
  metafields?: ({ key: string; value: string } | null)[];
};

function normalizeProduct(p: RawProduct): ShopifyProduct {
  const metafields: Record<string, string> = {};
  for (const field of p.metafields ?? []) {
    if (field?.value) metafields[field.key] = field.value;
  }
  return {
    ...p,
    images: p.images.edges.map((e) => e.node),
    variants: p.variants.edges.map((e) => e.node),
    collections: p.collections.edges.map((e) => e.node),
    metafields,
  };
}

/**
 * `@inContext(country:)` plumbing. When a country is given, prices come back in
 * that market's presentment currency (real Shopify FX + rounding); otherwise the
 * query runs in the store's base currency. Requires Shopify Markets to be
 * configured for the country — an unconfigured market just returns base prices.
 */
function contextParts(country?: CountryCode) {
  return country
    ? { varDecl: ", $country: CountryCode!", directive: " @inContext(country: $country)" }
    : { varDecl: "", directive: "" };
}

/** Fetch a page of products (newest first by default). */
export async function getProducts(
  first = 50,
  sortKey: "TITLE" | "PRICE" | "CREATED_AT" | "BEST_SELLING" = "CREATED_AT",
  country?: CountryCode,
): Promise<ShopifyProduct[]> {
  const { varDecl, directive } = contextParts(country);
  const data = await shopifyFetch<{
    products: { edges: { node: RawProduct }[] };
  }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Products($first: Int!, $sortKey: ProductSortKeys!${varDecl})${directive} {
        products(first: $first, sortKey: $sortKey) {
          edges { node { ...ProductFields } }
        }
      }
    `,
    country ? { first, sortKey, country } : { first, sortKey },
    60,
    false, // tokenless
  );
  return data.products.edges.map((e) => normalizeProduct(e.node));
}

/** Fetch a single product by its handle (URL slug). Returns null if not found. */
export async function getProduct(
  handle: string,
  country?: CountryCode,
): Promise<ShopifyProduct | null> {
  const { varDecl, directive } = contextParts(country);
  const data = await shopifyFetch<{ product: RawProduct | null }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Product($handle: String!${varDecl})${directive} {
        product(handle: $handle) { ...ProductFields }
      }
    `,
    country ? { handle, country } : { handle },
    60,
    false, // tokenless
  );
  return data.product ? normalizeProduct(data.product) : null;
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  /** The collection's image, set in Shopify admin. */
  image: ShopifyImage | null;
  products: ShopifyProduct[];
};

type RawCollection = Omit<ShopifyCollection, "products"> & {
  /** Absent on the lightweight list query, which omits products for cost. */
  products?: { edges: { node: RawProduct }[] };
};

function normalizeCollection(c: RawCollection): ShopifyCollection {
  return {
    ...c,
    products: c.products?.edges.map((e) => normalizeProduct(e.node)) ?? [],
  };
}

/**
 * Fetch the storefront collections' metadata (no products — keeps the query
 * cheap for the nav and homepage grid; nesting the product fragment here blows
 * past the Storefront API complexity budget). Shopify's automatic "frontpage"
 * collection is included — callers filter it out. Use `getCollection` for a
 * single collection's products.
 */
export async function getCollections(first = 10): Promise<ShopifyCollection[]> {
  const data = await shopifyFetch<{
    collections: { edges: { node: RawCollection }[] };
  }>(
    /* GraphQL */ `
      query Collections($first: Int!) {
        collections(first: $first, sortKey: TITLE) {
          edges {
            node {
              id
              handle
              title
              description
              image { url altText }
            }
          }
        }
      }
    `,
    { first },
    60,
    false, // tokenless
  );
  return data.collections.edges.map((e) => normalizeCollection(e.node));
}

/**
 * Fetch a single collection by handle, with its products. Null if not found.
 * `productLimit` is capped low because each product carries the full fragment
 * (~27 complexity units) and the Storefront API budget is 1000.
 */
export async function getCollection(
  handle: string,
  productLimit = 30,
  country?: CountryCode,
): Promise<ShopifyCollection | null> {
  const { varDecl, directive } = contextParts(country);
  const data = await shopifyFetch<{ collection: RawCollection | null }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Collection($handle: String!, $productLimit: Int!${varDecl})${directive} {
        collection(handle: $handle) {
          id
          handle
          title
          description
          image { url altText }
          products(first: $productLimit) {
            edges { node { ...ProductFields } }
          }
        }
      }
    `,
    country ? { handle, productLimit, country } : { handle, productLimit },
    60,
    false, // tokenless
  );
  return data.collection ? normalizeCollection(data.collection) : null;
}

/* ------------------------------------------------------------------ */
/* Localization (Shopify Markets — available countries + currencies)   */
/* ------------------------------------------------------------------ */

export type ShopifyCurrency = {
  /** ISO 4217 code, e.g. "GBP". */
  isoCode: string;
  /** Human-readable name, e.g. "British Pound". */
  name: string;
  /** Currency symbol, e.g. "£". */
  symbol: string;
};

export type ShopifyCountry = {
  /** ISO 3166-1 alpha-2 code, e.g. "GB". */
  isoCode: string;
  /** Human-readable name, e.g. "United Kingdom". */
  name: string;
  currency: ShopifyCurrency;
};

export type ShopifyLocalization = {
  /** The countries the store's Markets are configured to sell to. */
  availableCountries: ShopifyCountry[];
  /** Shopify's best guess at the buyer's country (from the request), if any. */
  country: ShopifyCountry;
};

/**
 * Available markets (countries + their presentment currencies) and Shopify's
 * geo-detected buyer country. Drives the currency selector. Runs tokenless like
 * the catalogue reads. If Markets isn't configured this returns just the primary
 * market (typically GB), which is the graceful single-currency fallback.
 */
export async function getLocalization(): Promise<ShopifyLocalization> {
  const data = await shopifyFetch<{ localization: ShopifyLocalization }>(
    /* GraphQL */ `
      query Localization {
        localization {
          availableCountries {
            isoCode
            name
            currency { isoCode name symbol }
          }
          country {
            isoCode
            name
            currency { isoCode name symbol }
          }
        }
      }
    `,
    {},
    3600, // markets change rarely — cache for an hour
    false, // tokenless
  );
  return data.localization;
}
