/**
 * Client-side cart store, backed by the Shopify Cart API (via server actions).
 *
 * Designed to stay correct and feel instant on slow networks:
 *
 * - Optimistic updates: quantity changes and removals apply to the UI
 *   immediately via an overlay (`pendingQuantities`) on top of the last
 *   confirmed Shopify cart, then reconcile with the server response. On
 *   failure the overlay is rolled back and an error toast is emitted.
 * - Absolute quantities + debounce: rapid +/− taps coalesce into one
 *   "set line to N" request (idempotent, so it's safe to retry once).
 * - Serialized mutations: every network operation runs through a single
 *   promise queue, so responses can never apply out of order.
 * - Timeouts: a hung request fails after ~10s instead of leaving the UI in
 *   limbo; the store then re-fetches the cart to resync with Shopify.
 * - `cartSettled()` flushes pending work before checkout, so the shopper is
 *   always charged for exactly the cart they saw.
 *
 * Components read state through useSyncExternalStore; `getCartSnapshot`
 * returns a stable cached reference so React doesn't loop. Drawer open/close
 * is ephemeral UI state. Checkout is not handled here — components send the
 * customer to `cart.checkoutUrl` (Shopify-hosted checkout).
 */
"use client";

import {
  type AddToCartResult,
  addToCartAction,
  getCartAction,
  updateLinesAction,
} from "./cart-actions";
import type { Cart, CartLine, Money } from "./shopify-cart";

export type { AddToCartResult, Cart, CartLine, Money };

const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 600;
const FLUSH_DELAY_MS = 350;

const NETWORK_ERROR_MESSAGE =
  "We couldn't update your cart. Please check your connection and try again.";

/* --- Cart state --- */

/** Last cart state confirmed by Shopify. */
let serverCart: Cart | null = null;
/** Optimistic overlay: line id → desired absolute quantity (0 = removed). */
const pendingQuantities = new Map<string, number>();
/** Derived snapshot (serverCart + overlay), cached for useSyncExternalStore. */
let cache: Cart | null = null;
/** Line ids with unconfirmed changes (drives per-line pending styling). */
const NO_PENDING_LINES: ReadonlySet<string> = new Set();
let pendingLines: ReadonlySet<string> = NO_PENDING_LINES;

let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Overlay the optimistic quantities onto the confirmed cart. */
function applyOverlay(base: Cart | null): Cart | null {
  if (!base || pendingQuantities.size === 0) return base;
  const changesAnything = base.lines.some((line) => {
    const desired = pendingQuantities.get(line.id);
    return desired !== undefined && desired !== line.quantity;
  });
  if (!changesAnything) return base;

  let subtotal = Number(base.subtotal.amount);
  let totalQuantity = 0;
  const lines: CartLine[] = [];
  for (const line of base.lines) {
    const desired = pendingQuantities.get(line.id) ?? line.quantity;
    if (desired === line.quantity) {
      lines.push(line);
      totalQuantity += line.quantity;
      continue;
    }
    const unitPrice = Number(line.lineTotal.amount) / (line.quantity || 1);
    subtotal += unitPrice * (desired - line.quantity);
    if (desired > 0) {
      lines.push({
        ...line,
        quantity: desired,
        lineTotal: {
          amount: (unitPrice * desired).toFixed(2),
          currencyCode: line.lineTotal.currencyCode,
        },
      });
      totalQuantity += desired;
    }
  }
  return {
    ...base,
    totalQuantity,
    subtotal: {
      amount: Math.max(0, subtotal).toFixed(2),
      currencyCode: base.subtotal.currencyCode,
    },
    lines,
  };
}

/** Recompute the derived snapshot + pending set, then notify subscribers. */
function rederive() {
  cache = applyOverlay(serverCart);
  pendingLines =
    pendingQuantities.size === 0
      ? NO_PENDING_LINES
      : new Set(pendingQuantities.keys());
  emit();
}

export function subscribeCart(callback: () => void) {
  listeners.add(callback);
  installResync();
  void hydrate();
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Coming back from Shopify's hosted checkout (Back button, or the order
 * confirmation's "continue shopping" link) usually restores this page from the
 * browser's back/forward cache — with the pre-purchase cart still in memory,
 * and `hydrate()` long since done. Re-sync whenever the page is shown again:
 * Shopify invalidates a cart once its checkout completes, so `getCart` comes
 * back null, the stale cookie is cleared, and the UI empties. An abandoned
 * checkout re-fetches the same still-live cart, so nothing is lost.
 */
let resyncInstalled = false;

function installResync() {
  if (resyncInstalled || typeof window === "undefined") return;
  resyncInstalled = true;
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) void refreshCart();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void refreshCart();
  });
}

export function getCartSnapshot(): Cart | null {
  return cache;
}

export function getCartServerSnapshot(): Cart | null {
  return null;
}

/** Line ids with in-flight/unconfirmed changes. Subscribe via subscribeCart. */
export function getPendingLinesSnapshot(): ReadonlySet<string> {
  return pendingLines;
}

export function getPendingLinesServerSnapshot(): ReadonlySet<string> {
  return NO_PENDING_LINES;
}

/** Total item count across all lines. */
export function cartCount(cart: Cart | null): number {
  return cart?.totalQuantity ?? 0;
}

/* --- Error toast state (mutation failures, surfaced by CartDrawer) --- */

let cartError: { id: number; message: string } | null = null;
let errorSeq = 0;
const errorListeners = new Set<() => void>();

function notifyError(message: string) {
  cartError = { id: ++errorSeq, message };
  errorListeners.forEach((listener) => listener());
}

export function subscribeCartError(callback: () => void) {
  errorListeners.add(callback);
  return () => {
    errorListeners.delete(callback);
  };
}

export function getCartErrorSnapshot() {
  return cartError;
}

export function getCartErrorServerSnapshot() {
  return null;
}

export function dismissCartError() {
  if (!cartError) return;
  cartError = null;
  errorListeners.forEach((listener) => listener());
}

/* --- Mutation queue + network helpers --- */

/**
 * All network operations run through this single chain, so a slow response
 * can never overwrite the result of a later mutation (no out-of-order
 * application, no client-side races).
 */
let queue: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): Promise<void> {
  const next = queue.then(task, task);
  queue = next;
  return next;
}

/** Fail a hung request after REQUEST_TIMEOUT_MS instead of waiting forever. */
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Cart request timed out")),
      REQUEST_TIMEOUT_MS,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* --- Reads --- */

/** Load the existing cart once, the first time anything subscribes. */
async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  await enqueue(async () => {
    try {
      serverCart = await withTimeout(getCartAction());
      rederive();
    } catch {
      // No cart / network issue — start empty.
    }
  });
}

/**
 * Re-fetch the cart from Shopify — call after the shopper changes currency so
 * the drawer reflects the new market prices (getCart self-heals buyerIdentity).
 * Runs through the mutation queue so it can't clobber an in-flight change.
 */
export async function refreshCart() {
  await enqueue(async () => {
    try {
      serverCart = await withTimeout(getCartAction());
      rederive();
    } catch {
      // Keep the current cart on a transient failure.
    }
  });
}

/* --- Mutations --- */

export async function addToCart(input: {
  handle: string;
  color: string;
  size: string;
  quantity: number;
}): Promise<AddToCartResult> {
  let result: AddToCartResult = { ok: false, error: NETWORK_ERROR_MESSAGE };
  await enqueue(async () => {
    try {
      result = await withTimeout(addToCartAction(input));
      if (result.ok) {
        serverCart = result.cart;
        rederive();
      }
    } catch {
      // Adding isn't idempotent, so don't auto-retry — the request may still
      // have landed. Resync so the drawer shows whatever Shopify really has.
      result = { ok: false, error: NETWORK_ERROR_MESSAGE };
      void refreshCart();
    }
  });
  return result;
}

/**
 * Optimistically set a line's absolute quantity (0 removes it). The UI updates
 * immediately; rapid taps coalesce into one debounced request to Shopify.
 */
export function updateLine(lineId: string, quantity: number) {
  pendingQuantities.set(lineId, Math.max(0, Math.floor(quantity)));
  rederive();
  scheduleFlush();
}

/** Optimistically remove a line (quantity 0). */
export function removeLine(lineId: string) {
  updateLine(lineId, 0);
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushQuantities();
  }, FLUSH_DELAY_MS);
}

/** Send the coalesced quantity changes to Shopify and reconcile. */
function flushQuantities(): Promise<void> {
  return enqueue(async () => {
    // Drop no-op entries (back to the confirmed quantity) and entries for
    // lines Shopify no longer has (e.g. the cart expired and was replaced).
    for (const [id, quantity] of [...pendingQuantities]) {
      const line = serverCart?.lines.find((l) => l.id === id);
      if (!line || line.quantity === quantity) pendingQuantities.delete(id);
    }
    const batch = [...pendingQuantities.entries()];
    if (batch.length === 0) {
      rederive();
      return;
    }

    try {
      const lines = batch.map(([id, quantity]) => ({ id, quantity }));
      let cart: Cart | null;
      try {
        cart = await withTimeout(updateLinesAction(lines));
      } catch {
        // Absolute quantities are idempotent — one retry is safe.
        await delay(RETRY_DELAY_MS);
        cart = await withTimeout(updateLinesAction(lines));
      }
      // Clear only entries the user hasn't changed again mid-flight; a newer
      // value stays pending and the follow-up flush below sends it.
      for (const [id, quantity] of batch) {
        if (pendingQuantities.get(id) === quantity) pendingQuantities.delete(id);
      }
      serverCart = cart;
      rederive();
      if (pendingQuantities.size > 0) scheduleFlush();
    } catch {
      // Roll back what we tried to send, tell the user, and resync.
      for (const [id, quantity] of batch) {
        if (pendingQuantities.get(id) === quantity) pendingQuantities.delete(id);
      }
      rederive();
      notifyError(NETWORK_ERROR_MESSAGE);
      void refreshCart();
    }
  });
}

/**
 * Flush pending changes and wait for every queued operation to finish, then
 * return the confirmed cart. Call before checkout so the shopper is charged
 * for exactly what they see.
 */
export async function cartSettled(): Promise<Cart | null> {
  // A handful of rounds covers changes made while earlier flushes were in
  // flight; each round drains the queue.
  for (let round = 0; round < 5; round++) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    await flushQuantities();
    if (pendingQuantities.size === 0) break;
  }
  return cache;
}

/* --- Formatting helpers --- */

/** Format a Shopify money value in its own currency (the store currency). */
export function formatMoney(money: Money): string {
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: money.currencyCode,
    }).format(amount);
  } catch {
    return `${money.currencyCode} ${amount.toFixed(2)}`;
  }
}

/** Display label for a line's variant, e.g. "Black · M". */
export function lineSubtitle(line: CartLine): string {
  return line.options
    .filter((o) => o.value && o.value !== "Default Title")
    .map((o) => o.value)
    .join(" · ");
}

/* --- Drawer open/close (ephemeral UI state, not persisted) --- */

let drawerOpen = false;
const openListeners = new Set<() => void>();

export function subscribeCartOpen(callback: () => void) {
  openListeners.add(callback);
  return () => {
    openListeners.delete(callback);
  };
}

export function getCartOpenSnapshot() {
  return drawerOpen;
}

export function getCartOpenServerSnapshot() {
  return false;
}

export function openCart() {
  drawerOpen = true;
  openListeners.forEach((listener) => listener());
}

export function closeCart() {
  drawerOpen = false;
  openListeners.forEach((listener) => listener());
}
