/**
 * Customer session — httpOnly cookie holding the Storefront `customerAccessToken`.
 *
 * The token is opaque and obtained from `customerAccessTokenCreate` (login) or
 * `customerResetByUrl` (password reset). We keep it in an httpOnly + secure (prod)
 * cookie so it never reaches client JS, and expire the cookie in lockstep with
 * the token's `expiresAt`. Server-only (uses next/headers `cookies()`).
 */
import { cookies } from "next/headers";

const TOKEN_COOKIE = "an_customer_token";
const isProd = process.env.NODE_ENV === "production";

type StoredToken = { accessToken: string; expiresAt: string };

/** Persist the access token, expiring the cookie when the token does. */
export async function setCustomerToken(
  accessToken: string,
  expiresAt: string,
): Promise<void> {
  const store = await cookies();
  store.set(TOKEN_COOKIE, JSON.stringify({ accessToken, expiresAt }), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Return a non-expired access token, or null. */
export async function getCustomerToken(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(TOKEN_COOKIE)?.value;
  if (!raw) return null;
  try {
    const { accessToken, expiresAt } = JSON.parse(raw) as StoredToken;
    if (new Date(expiresAt).getTime() <= Date.now()) return null;
    return accessToken;
  } catch {
    return null;
  }
}

/** Clear the session cookie (logout). */
export async function clearCustomerToken(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}
