/**
 * Server actions for customer auth + account management (Storefront Customer API).
 *
 * Two shapes:
 *   - Auth actions (login/register/recover/reset/logout) are `useActionState`
 *     handlers: `(prevState, formData) => FormState`. They set/clear the token
 *     cookie and redirect on success.
 *   - Dashboard actions (profile/address) are called directly from the client and
 *     return Shopify `userErrors` (empty = success), revalidating /account.
 */
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  type AddressInput,
  type UserError,
  createCustomerAddress,
  deleteCustomerAddress,
  deleteCustomerToken,
  getCustomerSummary,
  loginCustomer,
  recoverCustomer,
  registerCustomer,
  resetCustomerByUrl,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from "@/lib/customer";
import {
  clearCustomerToken,
  getCustomerToken,
  setCustomerToken,
} from "@/lib/session";
import { markSubscribed, setBuyerEmail } from "@/lib/subscriber";

export type FormState = { error?: string; success?: string };

/**
 * Stamp the subscriber cookies from a fresh session: the account email always
 * goes on future carts' buyerIdentity (so segment discounts can apply), and the
 * subscriber display flag follows the profile's marketing consent. Best-effort —
 * a failure here must never block login.
 */
async function syncSubscriberCookies(accessToken: string): Promise<void> {
  try {
    const profile = await getCustomerSummary(accessToken);
    if (profile?.email) await setBuyerEmail(profile.email.toLowerCase());
    if (profile?.acceptsMarketing) await markSubscribed();
  } catch {
    // Non-fatal — the cart self-heal will pick identity up on a later login.
  }
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const result = await loginCustomer(email, password);
  if ("error" in result) return { error: result.error };

  await setCustomerToken(result.accessToken, result.expiresAt);
  await syncSubscriberCookies(result.accessToken);
  redirect("/account");
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const acceptsMarketing = formData.get("acceptsMarketing") === "on";

  if (!firstName || !lastName || !email || !password) {
    return { error: "Please fill in all fields." };
  }
  if (password !== confirm) return { error: "Passwords don't match." };

  const errors = await registerCustomer({
    firstName,
    lastName,
    email,
    password,
    acceptsMarketing,
  });
  if (errors.length > 0) return { error: errors[0].message };

  // Their email rides on future carts either way; the subscriber prices only
  // unlock when they've actually opted in to marketing.
  await setBuyerEmail(email.toLowerCase());
  if (acceptsMarketing) await markSubscribed();

  // Account created — log in straight away for a seamless first session.
  const token = await loginCustomer(email, password);
  if ("error" in token) redirect("/login");

  await setCustomerToken(token.accessToken, token.expiresAt);
  redirect("/account");
}

export async function recoverAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  // Swallow errors so we never reveal whether an account exists.
  await recoverCustomer(email);
  return {
    success: "If an account exists for that email, we've sent a reset link.",
  };
}

export async function resetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const resetUrl = String(formData.get("resetUrl") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!resetUrl) return { error: "This reset link is invalid or expired." };
  if (!password) return { error: "Enter a new password." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const result = await resetCustomerByUrl(resetUrl, password);
  if ("error" in result) return { error: result.error };

  await setCustomerToken(result.accessToken, result.expiresAt);
  await syncSubscriberCookies(result.accessToken);
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  const token = await getCustomerToken();
  if (token) await deleteCustomerToken(token);
  await clearCustomerToken();
  redirect("/");
}

/* ------------------------------------------------------------------ */
/* Dashboard (profile + addresses)                                     */
/* ------------------------------------------------------------------ */

/** Resolve the access token or bounce to login (token expired between renders). */
async function requireToken(): Promise<string> {
  const token = await getCustomerToken();
  if (!token) redirect("/login");
  return token;
}

export async function saveProfileAction(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<UserError[]> {
  const token = await requireToken();
  // Omit an empty phone so we don't send "" to Shopify (it rejects it).
  const customer = { ...input, phone: input.phone.trim() || undefined };
  const errors = await updateCustomerProfile(token, customer);
  if (errors.length === 0) revalidatePath("/account");
  return errors;
}

export async function createAddressAction(
  address: AddressInput,
  setAsDefault: boolean,
): Promise<UserError[]> {
  const token = await requireToken();
  const { id, errors } = await createCustomerAddress(token, address);
  if (errors.length > 0) return errors;
  if (setAsDefault && id) {
    const defaultErrors = await setDefaultCustomerAddress(token, id);
    if (defaultErrors.length > 0) return defaultErrors;
  }
  revalidatePath("/account");
  return [];
}

export async function updateAddressAction(
  id: string,
  address: AddressInput,
  setAsDefault: boolean,
): Promise<UserError[]> {
  const token = await requireToken();
  const errors = await updateCustomerAddress(token, id, address);
  if (errors.length > 0) return errors;
  if (setAsDefault) {
    const defaultErrors = await setDefaultCustomerAddress(token, id);
    if (defaultErrors.length > 0) return defaultErrors;
  }
  revalidatePath("/account");
  return [];
}

export async function deleteAddressAction(id: string): Promise<UserError[]> {
  const token = await requireToken();
  const errors = await deleteCustomerAddress(token, id);
  if (errors.length === 0) revalidatePath("/account");
  return errors;
}

export async function setDefaultAddressAction(id: string): Promise<UserError[]> {
  const token = await requireToken();
  const errors = await setDefaultCustomerAddress(token, id);
  if (errors.length === 0) revalidatePath("/account");
  return errors;
}
