"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  cartSettled,
  closeCart,
  dismissCartError,
  formatMoney,
  getCartErrorServerSnapshot,
  getCartErrorSnapshot,
  getCartOpenServerSnapshot,
  getCartOpenSnapshot,
  getCartServerSnapshot,
  getCartSnapshot,
  getPendingLinesServerSnapshot,
  getPendingLinesSnapshot,
  lineSubtitle,
  removeLine,
  subscribeCart,
  subscribeCartError,
  subscribeCartOpen,
  updateLine,
} from "@/lib/cart";

/**
 * Toast for cart mutation failures (slow/offline networks). Rendered by
 * CartDrawer since that's mounted globally in the layout, so failures surface
 * on any page — including /cart — even while the drawer is closed.
 */
function CartErrorToast() {
  const error = useSyncExternalStore(
    subscribeCartError,
    getCartErrorSnapshot,
    getCartErrorServerSnapshot,
  );

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(dismissCartError, 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  if (!error) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 bg-brand-black px-5 py-3.5 text-center font-body text-[13px] text-brand-white shadow-xl"
    >
      {error.message}
    </div>
  );
}

/**
 * Slide-in cart panel (from the right). Opened by the header cart icon on every
 * screen size; shows the Shopify cart lines with quantity controls, a link to the
 * full /cart page, and a checkout button that hands off to Shopify's hosted
 * checkout (cart.checkoutUrl).
 */
export function CartDrawer() {
  const pathname = usePathname();
  const open = useSyncExternalStore(
    subscribeCartOpen,
    getCartOpenSnapshot,
    getCartOpenServerSnapshot,
  );
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const pendingLines = useSyncExternalStore(
    subscribeCart,
    getPendingLinesSnapshot,
    getPendingLinesServerSnapshot,
  );

  const [lastPath, setLastPath] = useState(pathname);
  const [removing, setRemoving] = useState<Set<string>>(() => new Set());
  const [checkingOut, setCheckingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fade/collapse the row out, then remove it from the cart (optimistic — the
  // store rolls the row back and shows a toast if Shopify rejects it).
  const beginRemove = (id: string) => {
    setRemoving((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      removeLine(id);
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  // Flush any in-flight quantity changes before handing off to Shopify's
  // hosted checkout, so the shopper is charged for exactly the cart they see.
  const checkout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    const settled = await cartSettled();
    if (settled && settled.lines.length > 0) {
      window.location.href = settled.checkoutUrl;
    } else {
      setCheckingOut(false);
    }
  };

  // Coming back from checkout via the back/forward cache restores this
  // component with `checkingOut` still true — re-arm the button.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setCheckingOut(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Close when the route changes (e.g. tapping "View full cart").
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) closeCart();
  }

  // Scroll lock + Escape to close + focus the panel.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <>
    <CartErrorToast />
    <div
      className={`fixed inset-0 z-[90] transition-opacity duration-300 ease-out ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-brand-black/40 transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-[88%] max-w-md flex-col bg-brand-white shadow-xl outline-none transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-light-gray px-5 py-4 sm:px-6">
          <span className="font-wordmark text-[14px] uppercase tracking-[0.15em]">
            Your Cart
          </span>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="-mr-2 inline-flex p-2"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag
              className="h-8 w-8 text-brand-gray"
              aria-hidden="true"
            />
            <p className="font-body text-sm text-brand-gray">
              Your cart is empty.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="inline-flex items-center justify-center bg-brand-black px-7 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <ul
              data-lenis-prevent
              className="flex-1 divide-y divide-brand-light-gray overflow-y-auto px-5 sm:px-6"
            >
              {lines.map((line) => (
                <li
                  key={line.id}
                  className={`flex gap-4 overflow-hidden transition-all duration-300 ease-out ${
                    removing.has(line.id)
                      ? "max-h-0 -translate-x-3 py-0 opacity-0"
                      : "max-h-[220px] py-5 opacity-100"
                  }`}
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-brand-light-gray">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.productTitle}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-wordmark text-[13px] uppercase tracking-[0.06em] text-brand-black">
                          {line.productTitle}
                        </p>
                        <p className="mt-0.5 font-body text-[12px] text-brand-gray">
                          {lineSubtitle(line)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => beginRemove(line.id)}
                        aria-label={`Remove ${line.productTitle}`}
                        className="-mr-1 -mt-1 inline-flex p-1 text-brand-gray transition-colors hover:text-brand-black"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="inline-flex items-center border border-brand-light-gray">
                        <button
                          type="button"
                          onClick={() =>
                            line.quantity === 1
                              ? beginRemove(line.id)
                              : updateLine(line.id, line.quantity - 1)
                          }
                          aria-label={`Decrease ${line.productTitle} quantity`}
                          className="inline-flex p-2 text-brand-black transition-colors hover:bg-brand-off-white"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="min-w-7 text-center font-body text-[13px] tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateLine(line.id, line.quantity + 1)}
                          aria-label={`Increase ${line.productTitle} quantity`}
                          className="inline-flex p-2 text-brand-black transition-colors hover:bg-brand-off-white"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span
                        className={`font-body text-[14px] text-brand-black tabular-nums transition-opacity ${
                          pendingLines.has(line.id) ? "opacity-40" : "opacity-100"
                        }`}
                      >
                        {formatMoney(line.lineTotal)}
                        {line.lineOriginal.amount !== line.lineTotal.amount ? (
                          <>
                            {" "}
                            <s className="text-brand-gray">
                              {formatMoney(line.lineOriginal)}
                            </s>
                          </>
                        ) : null}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-brand-light-gray px-5 py-5 sm:px-6">
              {cart?.discount ? (
                <div className="mb-2 flex items-center justify-between font-body text-[13px]">
                  <span className="text-brand-gray">
                    {cart.discount.title ?? "Discount"}
                  </span>
                  <span className="text-brand-black tabular-nums">
                    −{formatMoney(cart.discount.amount)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between font-body text-[14px]">
                <span className="text-brand-gray">Subtotal</span>
                <span className="font-medium text-brand-black tabular-nums">
                  {cart ? formatMoney(cart.total) : null}
                </span>
              </div>
              <p className="mt-1 font-body text-[12px] text-brand-gray">
                Shipping &amp; taxes calculated at checkout.
              </p>

              <button
                type="button"
                onClick={() => void checkout()}
                disabled={checkingOut}
                className="mt-4 inline-flex w-full items-center justify-center bg-brand-black px-7 py-3.5 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray disabled:opacity-60"
              >
                {checkingOut ? "One moment…" : "Checkout"}
              </button>
              <Link
                href="/cart"
                className="mt-3 block text-center font-body text-[12px] uppercase tracking-[0.12em] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
