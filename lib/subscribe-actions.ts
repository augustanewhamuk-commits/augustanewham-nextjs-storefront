/**
 * Newsletter subscription server action — shared by the footer form and the
 * subscribe modal.
 *
 * On success it stamps the subscriber cookies (see lib/subscriber.ts) so the
 * storefront starts rendering subscriber prices and attaching the email to the
 * Shopify cart's buyerIdentity, which is what actually unlocks the automatic
 * "Customer Discount" in cart + checkout.
 */
"use server";

import {
  getCustomerSummary,
  subscribeCustomer,
  subscribeLoggedInCustomer,
} from "@/lib/customer";
import { getCustomerToken } from "@/lib/session";
import { markSubscribed, setBuyerEmail } from "@/lib/subscriber";

export type SubscribeState = { error?: string; success?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUCCESS: SubscribeState = {
  success: "You're on the list — your 10% discount applies automatically in the cart.",
};

export async function subscribeAction(email: string): Promise<SubscribeState> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { error: "Enter a valid email address." };
  }

  // Logged-in shopper subscribing their own account email: flip marketing
  // consent on the account directly (customerCreate would report it as taken).
  const token = await getCustomerToken();
  if (token) {
    const profile = await getCustomerSummary(token);
    if (profile?.email && profile.email.toLowerCase() === trimmed) {
      const errors = await subscribeLoggedInCustomer(token);
      if (errors.length > 0) return { error: errors[0].message };
      await setBuyerEmail(trimmed);
      await markSubscribed();
      return SUCCESS;
    }
  }

  const result = await subscribeCustomer(trimmed);

  if (result === "subscribed") {
    await setBuyerEmail(trimmed);
    await markSubscribed();
    return SUCCESS;
  }

  if (result === "existing_account") {
    // The email already has an account whose consent we can't change from
    // here. Still stamp it on carts — Shopify only grants the discount if the
    // email is genuinely subscribed — but don't claim subscriber prices.
    await setBuyerEmail(trimmed);
    return {
      success:
        "This email already has an account — sign in to manage email preferences.",
    };
  }

  return { error: "Something went wrong — please try again." };
}
