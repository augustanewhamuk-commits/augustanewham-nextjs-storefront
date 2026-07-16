/**
 * Subscriber/buyer identity cookies (server-only, next/headers `cookies()`).
 *
 * Two separate signals:
 *   - `an_buyer_email` (httpOnly) — the email to stamp on the Shopify cart's
 *     buyerIdentity so segment-based automatic discounts (the subscriber 10%)
 *     can apply. Set on newsletter signup, login and registration. Shopify
 *     decides whether the email actually earns the discount, so a stale or
 *     wrong email is harmless.
 *   - `an_subscriber` — a display flag: "we believe this visitor is subscribed",
 *     driving the slashed prices on product pages. Only set when we've seen
 *     real evidence (successful subscribe, or a logged-in profile with
 *     acceptsMarketing). Never trusted for money — the cart/checkout amounts
 *     always come from Shopify.
 *
 * Neither cookie is cleared on logout: a newsletter subscription belongs to
 * the person/browser, not the login session.
 */
import { cookies } from "next/headers";

const BUYER_EMAIL_COOKIE = "an_buyer_email";
const SUBSCRIBER_COOKIE = "an_subscriber";
const ONE_YEAR = 60 * 60 * 24 * 365;
const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: ONE_YEAR,
};

/** The email to attach to carts (buyerIdentity), or null. */
export async function getBuyerEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(BUYER_EMAIL_COOKIE)?.value || null;
}

export async function setBuyerEmail(email: string): Promise<void> {
  const store = await cookies();
  store.set(BUYER_EMAIL_COOKIE, email, cookieOptions);
}

/** Whether to render subscriber (slashed) prices for this visitor. */
export async function isSubscriber(): Promise<boolean> {
  const store = await cookies();
  return store.get(SUBSCRIBER_COOKIE)?.value === "1";
}

export async function markSubscribed(): Promise<void> {
  const store = await cookies();
  store.set(SUBSCRIBER_COOKIE, "1", cookieOptions);
}
