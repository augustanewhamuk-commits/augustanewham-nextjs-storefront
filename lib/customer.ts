/**
 * Storefront Customer API — auth mutations + account data, all over `shopifyFetch`.
 *
 * This is the customer-account layer for a *custom app* (not headless): it uses
 * the same Storefront access token as the catalog, plus a per-customer
 * `customerAccessToken` minted at login. Auth screens (login/sign-up/forgot/reset)
 * are ours to build — Shopify only validates.
 *
 * All customer reads pass `revalidate: 0` so nothing is cached across customers.
 * Mutations surface Shopify's `customerUserErrors` rather than throwing, so the
 * UI can show field-level messages.
 *
 * Requires the app's Storefront scopes to include `unauthenticated_read_customers`
 * and `unauthenticated_write_customers`.
 */
import { shopifyFetch } from "./shopify";

export type UserError = {
  field: string[] | null;
  message: string;
  code: string | null;
};

export type Money = { amount: string; currencyCode: string };

export type CustomerAddress = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  defaultAddress: CustomerAddress | null;
  addresses: CustomerAddress[];
};

export type CustomerOrder = {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: Money;
  lineItems: { title: string; quantity: number }[];
};

export type AddressInput = {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
};

const ADDRESS_FIELDS = /* GraphQL */ `
  id
  firstName
  lastName
  company
  address1
  address2
  city
  province
  zip
  country
`;

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

type TokenSuccess = { accessToken: string; expiresAt: string };
type TokenResult = TokenSuccess | { error: string };

/** Exchange email + password for a customer access token. */
export async function loginCustomer(
  email: string,
  password: string,
): Promise<TokenResult> {
  const data = await shopifyFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: TokenSuccess | null;
      customerUserErrors: UserError[];
    };
  }>(
    /* GraphQL */ `
      mutation Login($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors { field message code }
        }
      }
    `,
    { input: { email, password } },
    0,
  );
  const { customerAccessToken, customerUserErrors } =
    data.customerAccessTokenCreate;
  if (customerAccessToken) return customerAccessToken;
  return {
    error:
      customerUserErrors[0]?.message ?? "Incorrect email or password.",
  };
}

/** Create an account. Returns userErrors (empty = success). */
export async function registerCustomer(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<UserError[]> {
  const data = await shopifyFetch<{
    customerCreate: { customerUserErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation Register($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer { id }
          customerUserErrors { field message code }
        }
      }
    `,
    { input },
    0,
  );
  return data.customerCreate.customerUserErrors;
}

/** Send a password-reset email. Errors are intentionally swallowed by callers. */
export async function recoverCustomer(email: string): Promise<UserError[]> {
  const data = await shopifyFetch<{
    customerRecover: { customerUserErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation Recover($email: String!) {
        customerRecover(email: $email) {
          customerUserErrors { field message code }
        }
      }
    `,
    { email },
    0,
  );
  return data.customerRecover.customerUserErrors;
}

/** Complete a reset using the URL from Shopify's reset email; logs the user in. */
export async function resetCustomerByUrl(
  resetUrl: string,
  password: string,
): Promise<TokenResult> {
  const data = await shopifyFetch<{
    customerResetByUrl: {
      customerAccessToken: TokenSuccess | null;
      customerUserErrors: UserError[];
    };
  }>(
    /* GraphQL */ `
      mutation Reset($resetUrl: URL!, $password: String!) {
        customerResetByUrl(resetUrl: $resetUrl, password: $password) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors { field message code }
        }
      }
    `,
    { resetUrl, password },
    0,
  );
  const { customerAccessToken, customerUserErrors } = data.customerResetByUrl;
  if (customerAccessToken) return customerAccessToken;
  return {
    error: customerUserErrors[0]?.message ?? "This reset link is invalid or expired.",
  };
}

/** Invalidate a customer access token (logout). Best-effort. */
export async function deleteCustomerToken(accessToken: string): Promise<void> {
  try {
    await shopifyFetch(
      /* GraphQL */ `
        mutation Logout($customerAccessToken: String!) {
          customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
            deletedAccessToken
            userErrors { field message }
          }
        }
      `,
      { customerAccessToken: accessToken },
      0,
    );
  } catch {
    // Token may already be expired/invalid — clearing the cookie is enough.
  }
}

/* ------------------------------------------------------------------ */
/* Account data                                                        */
/* ------------------------------------------------------------------ */

/** Fetch profile + addresses + recent orders. Returns null if the token is bad. */
export async function getAccount(
  accessToken: string,
  orderCount = 10,
): Promise<{ customer: Customer; orders: CustomerOrder[] } | null> {
  const data = await shopifyFetch<{
    customer:
      | (Omit<Customer, "addresses"> & {
          addresses: { edges: { node: CustomerAddress }[] };
          orders: {
            edges: {
              node: Omit<CustomerOrder, "lineItems"> & {
                lineItems: {
                  edges: { node: { title: string; quantity: number } }[];
                };
              };
            }[];
          };
        })
      | null;
  }>(
    /* GraphQL */ `
      query Account($token: String!, $orderCount: Int!) {
        customer(customerAccessToken: $token) {
          id
          firstName
          lastName
          email
          phone
          defaultAddress { ${ADDRESS_FIELDS} }
          addresses(first: 10) { edges { node { ${ADDRESS_FIELDS} } } }
          orders(first: $orderCount, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                name
                orderNumber
                processedAt
                financialStatus
                fulfillmentStatus
                totalPrice { amount currencyCode }
                lineItems(first: 50) { edges { node { title quantity } } }
              }
            }
          }
        }
      }
    `,
    { token: accessToken, orderCount },
    0,
  );

  if (!data.customer) return null;
  const { addresses, orders, ...rest } = data.customer;
  return {
    customer: { ...rest, addresses: addresses.edges.map((e) => e.node) },
    orders: orders.edges.map((e) => ({
      ...e.node,
      lineItems: e.node.lineItems.edges.map((l) => l.node),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Profile + address mutations                                         */
/* ------------------------------------------------------------------ */

export async function updateCustomerProfile(
  accessToken: string,
  customer: { firstName?: string; lastName?: string; email?: string; phone?: string },
): Promise<UserError[]> {
  const data = await shopifyFetch<{
    customerUpdate: { customerUserErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation UpdateProfile($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer { id }
          customerUserErrors { field message code }
        }
      }
    `,
    { customerAccessToken: accessToken, customer },
    0,
  );
  return data.customerUpdate.customerUserErrors;
}

export async function createCustomerAddress(
  accessToken: string,
  address: AddressInput,
): Promise<{ id: string | null; errors: UserError[] }> {
  const data = await shopifyFetch<{
    customerAddressCreate: {
      customerAddress: { id: string } | null;
      customerUserErrors: UserError[];
    };
  }>(
    /* GraphQL */ `
      mutation CreateAddress($customerAccessToken: String!, $address: MailingAddressInput!) {
        customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
          customerAddress { id }
          customerUserErrors { field message code }
        }
      }
    `,
    { customerAccessToken: accessToken, address },
    0,
  );
  return {
    id: data.customerAddressCreate.customerAddress?.id ?? null,
    errors: data.customerAddressCreate.customerUserErrors,
  };
}

export async function updateCustomerAddress(
  accessToken: string,
  id: string,
  address: AddressInput,
): Promise<UserError[]> {
  const data = await shopifyFetch<{
    customerAddressUpdate: { customerUserErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation UpdateAddress($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
        customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
          customerAddress { id }
          customerUserErrors { field message code }
        }
      }
    `,
    { customerAccessToken: accessToken, id, address },
    0,
  );
  return data.customerAddressUpdate.customerUserErrors;
}

export async function deleteCustomerAddress(
  accessToken: string,
  id: string,
): Promise<UserError[]> {
  const data = await shopifyFetch<{
    customerAddressDelete: { deletedCustomerAddressId: string | null; customerUserErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation DeleteAddress($customerAccessToken: String!, $id: ID!) {
        customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
          deletedCustomerAddressId
          customerUserErrors { field message code }
        }
      }
    `,
    { customerAccessToken: accessToken, id },
    0,
  );
  return data.customerAddressDelete.customerUserErrors;
}

export async function setDefaultCustomerAddress(
  accessToken: string,
  addressId: string,
): Promise<UserError[]> {
  const data = await shopifyFetch<{
    customerDefaultAddressUpdate: { customerUserErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation SetDefaultAddress($customerAccessToken: String!, $addressId: ID!) {
        customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
          customer { id }
          customerUserErrors { field message code }
        }
      }
    `,
    { customerAccessToken: accessToken, addressId },
    0,
  );
  return data.customerDefaultAddressUpdate.customerUserErrors;
}
