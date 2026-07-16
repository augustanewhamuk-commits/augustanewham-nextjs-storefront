"use client";

import { createContext, useContext } from "react";

/**
 * Subscriber discount context — the layout (server) reads the subscriber
 * cookie and provides the display discount percentage here, so any client
 * component (product cards, detail page) can render slashed subscriber prices
 * without prop-drilling. `null` = visitor isn't a known subscriber, show
 * normal prices. Display only — cart/checkout money always comes from Shopify.
 */
const SubscriberDiscountContext = createContext<number | null>(null);

export function SubscriberProvider({
  discountPercent,
  children,
}: {
  discountPercent: number | null;
  children: React.ReactNode;
}) {
  return (
    <SubscriberDiscountContext.Provider value={discountPercent}>
      {children}
    </SubscriberDiscountContext.Provider>
  );
}

/** The visitor's subscriber discount percent, or null when not subscribed. */
export function useSubscriberDiscount(): number | null {
  return useContext(SubscriberDiscountContext);
}
