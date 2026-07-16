/**
 * Minimal Shopify Admin GraphQL client — used only for newsletter subscription
 * (setting email marketing consent, which the Storefront API can't do).
 *
 * Requires ADMIN_API_ACCESS_TOKEN in .env.local: a custom-app Admin token with
 * `read_customers` + `write_customers` scopes (Settings → Apps and sales
 * channels → Develop apps). Server-only — the token must never reach the
 * browser. When the token isn't configured, callers fall back to the
 * Storefront flow (see lib/subscribe-actions.ts).
 */

const RAW_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const ADMIN_TOKEN = process.env.ADMIN_API_ACCESS_TOKEN ?? "";

export const hasAdminApi = (): boolean => Boolean(ADMIN_TOKEN);

function endpoint(): string {
  const host = RAW_DOMAIN.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${host}/admin/api/${API_VERSION}/graphql.json`;
}

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!ADMIN_TOKEN) throw new Error("ADMIN_API_ACCESS_TOKEN is not set");
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
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
