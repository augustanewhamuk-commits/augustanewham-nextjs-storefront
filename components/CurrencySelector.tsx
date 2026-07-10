"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Globe, Search } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { setCountryCookie, type CurrencyOption } from "@/lib/currency";
import { refreshCart } from "@/lib/cart";

type FlagComponent = ComponentType<{ className?: string; title?: string }>;
const flagsByCountry = Flags as unknown as Record<string, FlagComponent>;

/**
 * Flags are rendered with `grayscale` so they read as neutral / monochrome and
 * sit comfortably in the black & white brand palette. (The package ships full
 * colour SVGs — there is no pure single-colour-black flag set — so grayscale is
 * the closest on-brand option.) Countries whose code doesn't map to a known flag
 * fall back to a neutral globe glyph.
 */
function CountryFlag({ country, label }: { country: string; label: string }) {
  const Flag = flagsByCountry[country];
  if (!Flag) {
    return (
      <Globe className="h-3.5 w-5 shrink-0 text-brand-gray" aria-hidden="true" />
    );
  }
  return <Flag title={label} className="h-3.5 w-5 shrink-0 object-cover" />;
}

/** A market's flag — or a globe for the catch-all "Rest of World" market. */
function MarketIcon({ option }: { option: CurrencyOption }) {
  if (option.fallback) {
    return (
      <Globe className="h-3.5 w-5 shrink-0 text-brand-gray" aria-hidden="true" />
    );
  }
  return <CountryFlag country={option.country} label={option.label} />;
}

/**
 * Currency selector. The list of currencies and the current selection come from
 * Shopify's configured markets (props, resolved server-side); picking one writes
 * the `an-country` cookie (its representative country) and refreshes so server
 * components re-fetch prices in that market's presentment currency (@inContext).
 * There is no client-side FX — Shopify does the conversion.
 */
export function CurrencySelector({
  currencies,
  current,
}: {
  currencies: CurrencyOption[];
  current: CurrencyOption;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only worth a search box once the list is long (e.g. many markets).
  const searchable = currencies.length > 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q) ||
        c.currencyName.toLowerCase().includes(q) ||
        c.countryName.toLowerCase().includes(q),
    );
  }, [query, currencies]);

  useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
  }, [open, searchable]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (country: string) => {
    setCountryCookie(country);
    setOpen(false);
    setQuery("");
    // Refresh server components (product prices) and the client cart drawer so
    // everything re-fetches in the new currency.
    startTransition(() => router.refresh());
    void refreshCart();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-busy={isPending}
        aria-label={`Region: ${current.label} — prices in ${current.currencyName} (${current.currencyCode})`}
        className="inline-flex items-center gap-1.5 text-brand-gray transition-colors hover:text-brand-black"
      >
        <MarketIcon option={current} />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[70] mt-2 w-64 border border-brand-black bg-brand-white shadow-lg">
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-brand-light-gray px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-brand-gray" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country"
                aria-label="Search country"
                className="w-full bg-transparent text-[12px] text-brand-black outline-none placeholder:text-brand-gray"
              />
            </div>
          ) : null}
          <ul
            role="listbox"
            aria-label="Select region"
            data-lenis-prevent
            className="max-h-72 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-brand-gray">No matches</li>
            ) : (
              filtered.map((c) => (
                <li key={c.currencyCode}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.currencyCode === current.currencyCode}
                    onClick={() => select(c.country)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] text-brand-black transition-colors hover:bg-brand-off-white"
                  >
                    <MarketIcon option={c} />
                    <span className="truncate">{c.label}</span>
                    <span className="ml-auto shrink-0 text-brand-gray">
                      {c.currencyCode}
                    </span>
                    {c.currencyCode === current.currencyCode ? (
                      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
