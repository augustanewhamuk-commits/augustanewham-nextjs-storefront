/**
 * Server-side resolution of the buyer's country, which drives Shopify's
 * `@inContext(country:)` price localisation.
 *
 * Precedence:
 *   1. The `an-country` cookie — the visitor's explicit pick in the currency
 *      selector (set client-side, read here). Always wins once chosen.
 *   2. A geo header set by the host/CDN (Vercel, Cloudflare, etc.) — the
 *      auto-detected country on first visit.
 *   3. `DEFAULT_COUNTRY` (GB, the brand's home market) as a last resort.
 *
 * Reading cookies()/headers() opts the calling page into dynamic rendering, which
 * is required anyway: prices differ per visitor, so they can't be baked at build.
 */
import { cookies, headers } from "next/headers";
import {
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  resolveMarketCountry,
  toCurrencyOptions,
  type CurrencyOption,
} from "./currency";
import { getLocalization, type CountryCode } from "./shopify";

/** Geo headers set by common hosts, in the order we trust them. */
const GEO_HEADERS = ["x-vercel-ip-country", "cf-ipcountry", "x-country-code"];

const isIsoCountry = (value: string | undefined | null): value is string =>
  !!value && /^[A-Z]{2}$/.test(value);

/**
 * The country to localise prices to for the current request, always resolved to
 * one of the store's markets (so rest-of-world routes to USD rather than the
 * visitor's local currency). Safe to call from any server component; falls back
 * to the catch-all market if nothing is detected.
 */
export async function getCountryContext(): Promise<CountryCode> {
  const cookieStore = await cookies();
  const chosen = cookieStore.get(COUNTRY_COOKIE)?.value?.toUpperCase();
  if (isIsoCountry(chosen)) return resolveMarketCountry(chosen);

  const headerStore = await headers();
  for (const name of GEO_HEADERS) {
    const geo = headerStore.get(name)?.toUpperCase();
    if (isIsoCountry(geo)) return resolveMarketCountry(geo);
  }

  return DEFAULT_COUNTRY;
}

/**
 * The distinct currencies to offer in the selector, plus the currently selected
 * one. "Current" is resolved by mapping the buyer's country (cookie/geo) to its
 * market currency, so an auto-detected shopper in any of the ~180 rest-of-world
 * countries correctly lands on (e.g.) USD. Used by the layout to populate the
 * header's currency selector.
 */
export async function getMarkets(): Promise<{
  currencies: CurrencyOption[];
  current: CurrencyOption;
}> {
  const [localization, contextCode] = await Promise.all([
    getLocalization(),
    getCountryContext(),
  ]);
  const currencies = toCurrencyOptions(localization.availableCountries);

  // contextCode is already a market representative country (getCountryContext
  // resolves rest-of-world → USD), so match the option by its country.
  const current =
    currencies.find((c) => c.country === contextCode) ?? currencies[0];

  return { currencies, current };
}
