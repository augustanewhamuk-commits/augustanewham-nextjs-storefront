/**
 * Shopify Storefront Cart API — server-side cart lifecycle + variant resolution.
 *
 * The cart lives in Shopify (so checkout, taxes, shipping and discounts are
 * authoritative); we only keep the cart *id* in an httpOnly cookie. Checkout is
 * a redirect to `cart.checkoutUrl`.
 *
 * Because the storefront catalogue is still static (lib/products.ts, no variant
 * GIDs), `resolveVariantId` maps a product handle + chosen colour/size onto a
 * Shopify `ProductVariant` id at add-to-cart time. If the product isn't found
 * (e.g. not yet published to the sales channel) the caller surfaces a friendly
 * "not available" message.
 *
 * Requires `read_carts` + `write_carts` Storefront scopes.
 */
import { cookies } from "next/headers";
import { shopifyFetch } from "./shopify";
import { getProduct as getShopifyProduct } from "./shopify";
import { getCountryContext } from "./country";

const CART_COOKIE = "an_cart_id";
const isProd = process.env.NODE_ENV === "production";

export type Money = { amount: string; currencyCode: string };

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  productTitle: string;
  productHandle: string;
  image: string | null;
  /** Selected variant options, e.g. [{name:"Color",value:"Black"}]. */
  options: { name: string; value: string }[];
  lineTotal: Money;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
};

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity { countryCode }
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              selectedOptions { name value }
              image { url altText }
              product { title handle }
            }
          }
        }
      }
    }
  }
`;

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  buyerIdentity: { countryCode: string | null } | null;
  cost: { subtotalAmount: Money };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        cost: { totalAmount: Money };
        merchandise: {
          id: string;
          selectedOptions: { name: string; value: string }[];
          image: { url: string; altText: string | null } | null;
          product: { title: string; handle: string };
        };
      };
    }[];
  };
};

function normalizeCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: raw.cost.subtotalAmount,
    // Shopify clamps a line to quantity 0 (instead of rejecting it) when the
    // variant is out of stock; such lines are dead weight — never show them.
    lines: raw.lines.edges
      .filter(({ node }) => node.quantity > 0)
      .map(({ node }) => ({
        id: node.id,
        quantity: node.quantity,
        merchandiseId: node.merchandise.id,
        productTitle: node.merchandise.product.title,
        productHandle: node.merchandise.product.handle,
        image: node.merchandise.image?.url ?? null,
        options: node.merchandise.selectedOptions,
        lineTotal: node.cost.totalAmount,
      })),
  };
}

/* ------------------------------------------------------------------ */
/* Cart-id cookie                                                      */
/* ------------------------------------------------------------------ */

async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function writeCartId(id: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // carts persist ~2 weeks
  });
}

async function clearCartId(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

/* ------------------------------------------------------------------ */
/* Variant resolution (static catalogue → Shopify variant id)          */
/* ------------------------------------------------------------------ */

export type ResolvedVariant = { id: string; available: boolean };

const norm = (s: string) => s.trim().toLowerCase();

/** Map a product handle + chosen colour/size to a Shopify variant. */
export async function resolveVariantId(
  handle: string,
  color: string,
  size: string,
): Promise<ResolvedVariant | null> {
  const product = await getShopifyProduct(handle);
  if (!product) return null;

  const wanted = [color, size].filter(Boolean).map(norm);
  const match =
    product.variants.find((variant) => {
      const values = variant.selectedOptions.map((o) => norm(o.value));
      return wanted.every((w) => values.includes(w));
    }) ??
    // Single-variant products have no options to match on.
    (product.variants.length === 1 ? product.variants[0] : undefined);

  if (!match) return null;
  return { id: match.id, available: match.availableForSale };
}

/* ------------------------------------------------------------------ */
/* Cart operations                                                     */
/* ------------------------------------------------------------------ */

/** Current cart, or null if none/expired (clears a stale cookie). */
export async function getCart(): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  const data = await shopifyFetch<{ cart: RawCart | null }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      query Cart($id: ID!) {
        cart(id: $id) { ...CartFields }
      }
    `,
    { id },
    0,
    false, // tokenless — match the tokenless catalogue context
  );
  if (!data.cart) {
    await clearCartId();
    return null;
  }

  // Self-heal the buyer's country so checkout prices track the currency the
  // shopper is browsing in (they may have switched region after the cart was
  // created, or the cart predates buyerIdentity support).
  const country = await getCountryContext();
  if (data.cart.buyerIdentity?.countryCode !== country) {
    const updated = await updateBuyerIdentity(data.cart.id, country);
    if (updated) return normalizeCart(updated);
  }

  return normalizeCart(data.cart);
}

/**
 * Point an existing cart at a country so Shopify locks in that market's catalog
 * price (and currency) through to checkout. Returns null if the cart is gone.
 */
async function updateBuyerIdentity(
  cartId: string,
  country: string,
): Promise<RawCart | null> {
  const data = await shopifyFetch<{
    cartBuyerIdentityUpdate: { cart: RawCart | null };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation UpdateBuyerIdentity(
        $cartId: ID!
        $buyerIdentity: CartBuyerIdentityInput!
      ) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
    { cartId, buyerIdentity: { countryCode: country } },
    0,
    false, // tokenless — match the tokenless catalogue context
  );
  return data.cartBuyerIdentityUpdate.cart;
}

export type AddLineResult = {
  cart: Cart;
  /** Shopify accepted the add but clamped the line to quantity 0 — sold out. */
  soldOut: boolean;
};

/**
 * When a variant is out of stock Shopify doesn't reject the add — it keeps the
 * line with quantity clamped to 0 (warning MERCHANDISE_OUT_OF_STOCK). This can
 * happen even when the catalogue still says availableForSale. Detect that
 * dead line, remove it from the cart, and tell the caller.
 */
async function finalizeAdd(
  raw: RawCart,
  merchandiseId: string,
): Promise<AddLineResult> {
  const clamped = raw.lines.edges.find(
    ({ node }) => node.merchandise.id === merchandiseId && node.quantity === 0,
  );
  if (!clamped) return { cart: normalizeCart(raw), soldOut: false };
  const cleaned = await removeLine(clamped.node.id);
  return { cart: cleaned ?? normalizeCart(raw), soldOut: true };
}

/** Add a line, creating the cart on first add. */
export async function addLine(
  merchandiseId: string,
  quantity: number,
): Promise<AddLineResult> {
  const id = await readCartId();

  if (!id) return createCartWithLine(merchandiseId, quantity);

  const data = await shopifyFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: { message: string }[] };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation AddLine($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
    { cartId: id, lines: [{ merchandiseId, quantity }] },
    0,
    false, // tokenless — match the tokenless catalogue context
  );

  // Cart expired between requests — start a fresh one.
  if (!data.cartLinesAdd.cart) return createCartWithLine(merchandiseId, quantity);
  return finalizeAdd(data.cartLinesAdd.cart, merchandiseId);
}

async function createCartWithLine(
  merchandiseId: string,
  quantity: number,
): Promise<AddLineResult> {
  // Stamp the buyer's country at creation so market pricing is locked in from
  // the first line through to checkout (see @inContext on the catalogue reads).
  const country = await getCountryContext();
  const data = await shopifyFetch<{
    cartCreate: { cart: RawCart; userErrors: { message: string }[] };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CreateCart($lines: [CartLineInput!]!, $country: CountryCode!) {
        cartCreate(input: { lines: $lines, buyerIdentity: { countryCode: $country } }) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
    { lines: [{ merchandiseId, quantity }], country },
    0,
    false, // tokenless — match the tokenless catalogue context
  );
  await writeCartId(data.cartCreate.cart.id);
  return finalizeAdd(data.cartCreate.cart, merchandiseId);
}

/** Set several lines' quantities in one mutation (quantity 0 removes a line). */
export async function updateLines(
  lines: { id: string; quantity: number }[],
): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: RawCart | null };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation UpdateLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
    { cartId: id, lines },
    0,
    false, // tokenless — match the tokenless catalogue context
  );
  return data.cartLinesUpdate.cart
    ? normalizeCart(data.cartLinesUpdate.cart)
    : null;
}

/** Set a line's quantity (0 removes it). */
export async function updateLine(
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  return updateLines([{ id: lineId, quantity }]);
}

/** Remove a line. */
export async function removeLine(lineId: string): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: RawCart | null };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation RemoveLine($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
    { cartId: id, lineIds: [lineId] },
    0,
    false, // tokenless — match the tokenless catalogue context
  );
  return data.cartLinesRemove.cart
    ? normalizeCart(data.cartLinesRemove.cart)
    : null;
}
