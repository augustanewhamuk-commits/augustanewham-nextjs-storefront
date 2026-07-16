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

const CONSENT_INPUT = {
  marketingState: "SUBSCRIBED",
  marketingOptInLevel: "SINGLE_OPT_IN",
};

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
export async function adminSubscribeEmail(email: string): Promise<boolean> {
  // Existing customer? Update their consent in place.
  const found = await adminFetch<{
    customers: { edges: { node: { id: string } }[] };
  }>(
    /* GraphQL */ `
      query FindCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges { node { id } }
        }
      }
    `,
    { query: `email:'${email.replace(/['\\]/g, "")}'` },
  );
  const existing = found.customers.edges[0]?.node;

  if (existing) {
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
      {
        input: {
          customerId: existing.id,
          emailMarketingConsent: CONSENT_INPUT,
        },
      },
    );
    return data.customerEmailMarketingConsentUpdate.userErrors.length === 0;
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
    { input: { email, emailMarketingConsent: CONSENT_INPUT } },
  );
  return created.customerCreate.userErrors.length === 0;
}
