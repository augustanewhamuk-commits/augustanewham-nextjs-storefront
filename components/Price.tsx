"use client";

import { formatPrice } from "@/lib/currency";
import { useSubscriberDiscount } from "./SubscriberContext";

/**
 * Product price that renders the subscriber discount as a slashed pair
 * ("£11.70 £13.00") when the visitor is a known subscriber, and the plain
 * price otherwise. Display only — Shopify applies the real discount in the
 * cart via the buyer email on buyerIdentity (see lib/discount.ts).
 *
 * `stacked` puts the struck original on its own line under the discounted
 * price (right-aligned) — for tight layouts like product cards, where the
 * side-by-side pair crowds the product name.
 */
export function Price({
  amount,
  currencyCode,
  stacked = false,
}: {
  amount: number;
  currencyCode: string;
  stacked?: boolean;
}) {
  const discountPercent = useSubscriberDiscount();
  if (discountPercent == null) {
    return <>{formatPrice(amount, currencyCode)}</>;
  }
  const discounted = Math.round(amount * (100 - discountPercent)) / 100;
  if (stacked) {
    return (
      <span className="inline-flex flex-col items-end leading-snug">
        <span>{formatPrice(discounted, currencyCode)}</span>
        <s className="text-[0.85em] font-normal text-brand-gray">
          {formatPrice(amount, currencyCode)}
        </s>
      </span>
    );
  }
  return (
    <>
      {formatPrice(discounted, currencyCode)}{" "}
      <s className="font-normal text-brand-gray">
        {formatPrice(amount, currencyCode)}
      </s>
    </>
  );
}
