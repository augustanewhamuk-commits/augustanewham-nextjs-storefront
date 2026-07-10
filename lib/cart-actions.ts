/**
 * Cart server actions — the client cart store (lib/cart.ts) calls these.
 *
 * Reads/mutations run server-side against the Storefront Cart API so the cart id
 * cookie and access token never touch the browser. Add-to-cart resolves the
 * Shopify variant from the static catalogue's handle + colour/size; it returns a
 * typed error when the product isn't purchasable yet (e.g. unpublished).
 */
"use server";

import {
  type Cart,
  addLine,
  getCart,
  removeLine,
  resolveVariantId,
  updateLine,
  updateLines,
} from "@/lib/shopify-cart";

export type AddToCartResult =
  | { ok: true; cart: Cart }
  | { ok: false; error: string };

export async function getCartAction(): Promise<Cart | null> {
  return getCart();
}

export async function addToCartAction(input: {
  handle: string;
  color: string;
  size: string;
  quantity: number;
}): Promise<AddToCartResult> {
  const variant = await resolveVariantId(input.handle, input.color, input.size);
  if (!variant) {
    return {
      ok: false,
      error: "This item isn't available to purchase online yet.",
    };
  }
  if (!variant.available) {
    return { ok: false, error: "This size is currently out of stock." };
  }
  const { cart, soldOut } = await addLine(variant.id, Math.max(1, input.quantity));
  // Shopify can clamp the add to quantity 0 when stock ran out even though the
  // catalogue still said availableForSale — surface that as out-of-stock.
  if (soldOut) {
    return { ok: false, error: "This size is currently out of stock." };
  }
  return { ok: true, cart };
}

export async function updateLineAction(
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  return updateLine(lineId, Math.max(0, quantity));
}

/**
 * Set several lines' absolute quantities in one Shopify mutation (0 removes a
 * line). Absolute quantities make the operation idempotent, so the client can
 * safely retry it after a timeout.
 */
export async function updateLinesAction(
  lines: { id: string; quantity: number }[],
): Promise<Cart | null> {
  return updateLines(
    lines.map((line) => ({ id: line.id, quantity: Math.max(0, line.quantity) })),
  );
}

export async function removeLineAction(lineId: string): Promise<Cart | null> {
  return removeLine(lineId);
}
