/**
 * Route gating for the customer account area.
 *
 * Presence check only: no `customerAccessToken` cookie → send to /login (with a
 * `redirect` hint so we can return after sign-in). Token validity/expiry is
 * checked on the actual data calls in the page, which falls back to /login if
 * the token is rejected. Middleware does no network I/O.
 */
import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "an_customer_token";

export function middleware(request: NextRequest) {
  if (!request.cookies.has(TOKEN_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
