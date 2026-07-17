/**
 * Minimal Shopify Admin GraphQL client — used only for newsletter subscription
 * (setting email marketing consent, which the Storefront API can't do).
 *
 * Auth (server-only — none of these values may reach the browser), first match
 * wins:
 *   1. ADMIN_API_ACCESS_TOKEN — a static `shpat_` token (legacy admin-created
 *      custom apps, pre-2026).
 *   2. SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET — the 2026 Dev
 *      Dashboard model: tokens no longer appear in any UI; instead the app's
 *      client credentials are exchanged for a ~24h admin token
 *      (client_credentials grant, org-owned app installed on the store),
 *      which we cache in memory and refresh before expiry.
 *
 * The app must have the `read_customers` + `write_customers` Admin scopes.
 * When neither auth is configured, callers fall back to the Storefront flow
 * (see lib/subscribe-actions.ts).
 */

const RAW_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const STATIC_TOKEN = process.env.ADMIN_API_ACCESS_TOKEN ?? "";
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET ?? "";

export const hasAdminApi = (): boolean =>
  Boolean(STATIC_TOKEN || (CLIENT_ID && CLIENT_SECRET));

function host(): string {
  return RAW_DOMAIN.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function endpoint(): string {
  return `https://${host()}/admin/api/${API_VERSION}/graphql.json`;
}

/** In-memory admin token from the client-credentials exchange. */
let cachedToken: { token: string; expiresAt: number } | null = null;

/** A valid admin token — static if configured, otherwise minted + cached. */
async function getAdminToken(): Promise<string> {
  if (STATIC_TOKEN) return STATIC_TOKEN;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Shopify Admin API credentials are not configured");
  }
  // Refresh with a 5-minute safety margin before the ~24h expiry.
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(`https://${host()}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(
      `Shopify client-credentials grant ${res.status}: ${await res.text()}`,
    );
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.token;
}

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const token = await getAdminToken();
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    // Fail fast on a stalled connection instead of hanging the form.
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Shopify Admin API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(
      `Shopify Admin API errors: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) throw new Error("Shopify Admin API returned no data");
  return json.data;
}

/**
 * Fresh consent payload. `consentUpdatedAt` must be the moment of THIS
 * signup: Shopify treats a missing/stale timestamp as "consent unchanged",
 * which can stop marketing automations (e.g. the welcome email) from firing.
 */
const consentInput = () => ({
  marketingState: "SUBSCRIBED",
  marketingOptInLevel: "SINGLE_OPT_IN",
  consentUpdatedAt: new Date().toISOString(),
});

/**
 * Subscribe an email to marketing via the Admin API. Unlike the Storefront
 * `customerCreate` route this:
 *   - works for emails that already belong to customers/accounts (including
 *     "inactivated" records, where Storefront customerCreate triggers an
 *     account-activation email instead of subscribing),
 *   - creates a plain customer record (no password/account), so Shopify sends
 *     no welcome or activation email at all.
 * Returns true when the email ends up subscribed.
 */
export type AdminSubscribeResult = {
  ok: boolean;
  /**
   * True only on a genuine transition to subscribed (new subscriber, or an
   * existing customer who wasn't subscribed). Repeat submissions of an
   * already-subscribed email come back false — the caller uses this to send
   * the welcome email exactly once.
   */
  newlySubscribed: boolean;
};

export async function adminSubscribeEmail(
  email: string,
): Promise<AdminSubscribeResult> {
  const existing = await findCustomer(email);
  if (existing) {
    if (existing.marketingState === "SUBSCRIBED") {
      return { ok: true, newlySubscribed: false };
    }
    const ok = await updateConsent(existing.id);
    return { ok, newlySubscribed: ok };
  }

  const created = await adminFetch<{
    customerCreate: { userErrors: { message: string }[] };
  }>(
    /* GraphQL */ `
      mutation SubscribeNew($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id }
          userErrors { message }
        }
      }
    `,
    { input: { email, emailMarketingConsent: consentInput() } },
  );
  const errors = created.customerCreate.userErrors;
  if (errors.length === 0) return { ok: true, newlySubscribed: true };

  // "Email has already been taken" despite the search miss: the customer
  // search index lags a few seconds behind writes (verified), so a very
  // recent record (double-submit, fresh registration) is findable only after
  // a short wait. Retry the lookup once, then update consent in place.
  if (errors.some((e) => /taken/i.test(e.message))) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const retried = await findCustomer(email);
    if (retried) {
      if (retried.marketingState === "SUBSCRIBED") {
        return { ok: true, newlySubscribed: false };
      }
      const ok = await updateConsent(retried.id);
      return { ok, newlySubscribed: ok };
    }
  }
  return { ok: false, newlySubscribed: false };
}

async function findCustomer(
  email: string,
): Promise<{ id: string; marketingState: string | null } | null> {
  const found = await adminFetch<{
    customers: {
      edges: {
        node: {
          id: string;
          emailMarketingConsent: { marketingState: string } | null;
        };
      }[];
    };
  }>(
    /* GraphQL */ `
      query FindCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              emailMarketingConsent { marketingState }
            }
          }
        }
      }
    `,
    { query: `email:'${email.replace(/['\\]/g, "")}'` },
  );
  const node = found.customers.edges[0]?.node;
  return node
    ? { id: node.id, marketingState: node.emailMarketingConsent?.marketingState ?? null }
    : null;
}

async function updateConsent(customerId: string): Promise<boolean> {
  const data = await adminFetch<{
    customerEmailMarketingConsentUpdate: {
      userErrors: { message: string }[];
    };
  }>(
    /* GraphQL */ `
      mutation SubscribeExisting($input: CustomerEmailMarketingConsentUpdateInput!) {
        customerEmailMarketingConsentUpdate(input: $input) {
          customer { id }
          userErrors { message }
        }
      }
    `,
    { input: { customerId, emailMarketingConsent: consentInput() } },
  );
  return data.customerEmailMarketingConsentUpdate.userErrors.length === 0;
}
