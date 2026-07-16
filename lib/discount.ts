/**
 * Subscriber ("Customer Discount") display config.
 *
 * The actual discount is a Shopify *automatic discount* named "Customer
 * Discount", restricted to the email-subscribers customer segment in admin.
 * Shopify only applies it to a cart whose buyerIdentity carries a subscribed
 * customer's email — the Storefront API never returns per-customer product
 * prices, so the slashed prices on listing/detail pages are computed here for
 * display and Shopify remains the source of truth in cart + checkout.
 *
 * IMPORTANT: keep this percentage in sync with the automatic discount in
 * Shopify admin (Discounts → Customer Discount).
 */
export const SUBSCRIBER_DISCOUNT_PERCENT = 10;

/** A price with the subscriber discount applied, rounded to pennies. */
export function subscriberPrice(amount: number): number {
  return Math.round(amount * (100 - SUBSCRIBER_DISCOUNT_PERCENT)) / 100;
}
