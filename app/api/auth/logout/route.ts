/**
 * GET /api/auth/logout — end the customer session.
 *
 * Invalidates the access token at Shopify (best-effort), clears the cookie, and
 * returns home. Exposed as GET so a header "Sign out" link works without a form.
 */
import { NextResponse, type NextRequest } from "next/server";
import { deleteCustomerToken } from "@/lib/customer";
import { clearCustomerToken, getCustomerToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = await getCustomerToken();
  if (token) await deleteCustomerToken(token);
  await clearCustomerToken();
  return NextResponse.redirect(new URL("/", request.url));
}
