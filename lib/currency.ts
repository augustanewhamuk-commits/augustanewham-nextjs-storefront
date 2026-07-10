/**
 * Currency helpers.
 *
 * Prices are now localised by Shopify via the `@inContext(country:)` directive
 * (see lib/shopify.ts + lib/country.ts): every product/collection query returns
 * its price already in the buyer's presentment currency, with Shopify's own FX
 * and per-market rounding. There is therefore NO client-side conversion or FX
 * table any more — we only format the amount + currency code Shopify gave us.
 *
 * The visitor's chosen country lives in the `an-country` cookie (readable on the
 * server to pick the `@inContext` country, writable on the client from the
 * currency selector). This module is client-safe: it must not import next/headers
 * or any server-only code.
 */

import type { ShopifyCountry } from "./shopify";

/** Cookie holding the visitor's chosen country (ISO 3166-1 alpha-2). */
export const COUNTRY_COOKIE = "an-country";

/**
 * The store's Shopify Markets, in the order shown in the selector. Each market is
 * addressed by one representative `country` — the code we send to Shopify's
 * `@inContext(country:)` and cart `buyerIdentity` so prices resolve to that
 * market's currency.
 *
 * Why this is an explicit list and not derived from `localization.availableCountries`:
 * that query returns every country with its *own local* currency (~99 distinct),
 * not the presentment currency of the market it belongs to — so it can't tell us
 * which currencies the store actually sells in. The markets rarely change; keep
 * this in sync with Shopify admin → Settings → Markets.
 *
 * `fallback: true` marks the catch-all market every other country routes to (the
 * "Global International Market"). Order it last.
 */
export const SUPPORTED_MARKETS: {
  currencyCode: string;
  country: string;
  /** How this market is shown in the selector (a country, or the catch-all). */
  label: string;
  fallback?: boolean;
}[] = [
  { currencyCode: "GBP", country: "GB", label: "United Kingdom" },
  { currencyCode: "EUR", country: "IE", label: "Ireland" },
  { currencyCode: "NGN", country: "NG", label: "Nigeria" },
  { currencyCode: "USD", country: "US", label: "Rest of World", fallback: true },
];

/** The catch-all market's representative country ("rest of world" → USD). */
export const DEFAULT_COUNTRY =
  SUPPORTED_MARKETS.find((m) => m.fallback)?.country ??
  SUPPORTED_MARKETS[0].country;

/**
 * Map any raw country (from geo/cookie) to the representative country of the
 * market it belongs to. Countries that are their own market (GB, IE, NG) map to
 * themselves; everything else routes to the fallback market (USD). This is what
 * makes "every other country → USD" true regardless of what local currency
 * Shopify would otherwise auto-convert to.
 */
export function resolveMarketCountry(raw: string): string {
  const direct = SUPPORTED_MARKETS.find((m) => m.country === raw);
  return direct ? direct.country : DEFAULT_COUNTRY;
}

/** One year, in seconds — how long the chosen-country cookie persists. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Format a Shopify money amount in its own currency. `amount` is the numeric
 * value Shopify returned (already in `currencyCode`); no conversion happens here.
 * Locale is left to the runtime so symbols/grouping read naturally.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    // Unknown/invalid currency code — degrade gracefully rather than throw.
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Persist the visitor's chosen country in a cookie so the server picks it up on
 * the next render. Client-only (touches document.cookie). Callers should trigger
 * a refresh afterwards so server components refetch prices in the new currency.
 */
export function setCountryCookie(isoCode: string): void {
  document.cookie = `${COUNTRY_COOKIE}=${isoCode}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/** A market the visitor can switch to, shown as a country. */
export type CurrencyOption = {
  /** Display label — a country name, or the catch-all ("Rest of World"). */
  label: string;
  /** True for the catch-all market (render a globe rather than a flag). */
  fallback: boolean;
  /** ISO 4217 code, e.g. "USD". */
  currencyCode: string;
  /** Human-readable name, e.g. "US Dollar". */
  currencyName: string;
  /** Currency symbol, e.g. "$". */
  currencySymbol: string;
  /** Representative country sent to Shopify `@inContext` and used for the flag. */
  country: string;
  countryName: string;
};

/**
 * The currency options shown in the selector: exactly the store's `SUPPORTED_MARKETS`,
 * enriched with each currency's display name/symbol and the representative country's
 * name from Shopify's `availableCountries` (so labels/flags stay in sync with
 * Shopify without trusting its noisy per-country currency data). Markets Shopify
 * doesn't report as available are dropped.
 */
export function toCurrencyOptions(countries: ShopifyCountry[]): CurrencyOption[] {
  const byCountry = new Map(countries.map((c) => [c.isoCode, c]));
  // Currency name/symbol can come from any country that uses that currency.
  const currencyMeta = new Map(
    countries.map((c) => [c.currency.isoCode, c.currency]),
  );

  return SUPPORTED_MARKETS.flatMap((market) => {
    const country = byCountry.get(market.country);
    const meta = currencyMeta.get(market.currencyCode);
    // Skip a market Shopify isn't actually serving (misconfigured / removed).
    if (!country && !meta) return [];
    return [
      {
        label: market.label,
        fallback: Boolean(market.fallback),
        currencyCode: market.currencyCode,
        currencyName: meta?.name ?? market.currencyCode,
        currencySymbol: meta?.symbol ?? "",
        country: market.country,
        countryName: country?.name ?? market.country,
      },
    ];
  });
}
