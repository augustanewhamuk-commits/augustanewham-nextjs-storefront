"use client";

import { formatPrice } from "@/lib/currency";
import { useSubscriberDiscount } from "./SubscriberContext";

/**
 * Product price that renders the subscriber discount as a slashed pair
 * ("£11.70 £13.00") when the visitor is a known subscriber, and the plain
 * price otherwise. Display only — Shopify applies the real discount in the
 * cart via the buyer email on buyerIdentity (see lib/discount.ts).
 */
export function Price({
  amount,
  currencyCode,
}: {
  amount: number;
  currencyCode: string;
}) {
  const discountPercent = useSubscriberDiscount();
  if (discountPercent == null) {
    return <>{formatPrice(amount, currencyCode)}</>;
  }
  const discounted = Math.round(amount * (100 - discountPercent)) / 100;
  return (
    <>
      {formatPrice(discounted, currencyCode)}{" "}
      <s className="font-normal text-brand-gray">
        {formatPrice(amount, currencyCode)}
      </s>
    </>
  );
}
