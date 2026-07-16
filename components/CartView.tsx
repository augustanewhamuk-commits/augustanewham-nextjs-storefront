"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  cartSettled,
  formatMoney,
  getCartServerSnapshot,
  getCartSnapshot,
  getPendingLinesServerSnapshot,
  getPendingLinesSnapshot,
  lineSubtitle,
  removeLine,
  subscribeCart,
  updateLine,
} from "@/lib/cart";

/** Full cart page body — line items + order summary, backed by the Shopify cart. */
export function CartView() {
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
  const [removing, setRemoving] = useState<Set<string>>(() => new Set());
  const [checkingOut, setCheckingOut] = useState(false);

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

  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 border border-brand-light-gray py-20 text-center">
        <p className="font-body text-sm text-brand-gray">Your cart is empty.</p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-brand-black px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      {/* Line items */}
      <ul className="divide-y divide-brand-light-gray border-y border-brand-light-gray">
        {lines.map((line) => (
          <li
            key={line.id}
            className={`flex gap-4 overflow-hidden transition-all duration-300 ease-out sm:gap-6 ${
              removing.has(line.id)
                ? "max-h-0 -translate-x-3 py-0 opacity-0"
                : "max-h-[320px] py-6 opacity-100"
            }`}
          >
            <Link
              href={`/product/${line.productHandle}`}
              className="relative h-32 w-24 shrink-0 overflow-hidden bg-brand-light-gray sm:h-40 sm:w-32"
            >
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.productTitle}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : null}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-wordmark text-[15px] uppercase tracking-[0.06em] text-brand-black">
                    <Link
                      href={`/product/${line.productHandle}`}
                      className="hover:underline"
                    >
                      {line.productTitle}
                    </Link>
                  </h2>
                  <p className="mt-1 font-body text-[13px] text-brand-gray">
                    {lineSubtitle(line)}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-body text-[15px] text-brand-black tabular-nums transition-opacity ${
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

              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="inline-flex items-center border border-brand-light-gray">
                  <button
                    type="button"
                    onClick={() =>
                      line.quantity === 1
                        ? beginRemove(line.id)
                        : updateLine(line.id, line.quantity - 1)
                    }
                    aria-label={`Decrease ${line.productTitle} quantity`}
                    className="inline-flex p-2.5 text-brand-black transition-colors hover:bg-brand-off-white"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <span className="min-w-8 text-center font-body text-[14px] tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateLine(line.id, line.quantity + 1)}
                    aria-label={`Increase ${line.productTitle} quantity`}
                    className="inline-flex p-2.5 text-brand-black transition-colors hover:bg-brand-off-white"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => beginRemove(line.id)}
                  className="inline-flex items-center gap-1.5 font-body text-[12px] uppercase tracking-[0.08em] text-brand-gray transition-colors hover:text-brand-black"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-brand-light-gray p-6 sm:p-8">
          <h2 className="font-wordmark text-base uppercase tracking-[0.12em] text-brand-black">
            Order Summary
          </h2>
          <dl className="mt-6 space-y-3 font-body text-[14px]">
            <div className="flex items-center justify-between">
              <dt className="text-brand-gray">Subtotal</dt>
              <dd className="text-brand-black tabular-nums">
                {cart ? formatMoney(cart.subtotal) : null}
              </dd>
            </div>
            {cart?.discount ? (
              <div className="flex items-center justify-between">
                <dt className="text-brand-gray">
                  {cart.discount.title ?? "Discount"}
                </dt>
                <dd className="text-brand-black tabular-nums">
                  −{formatMoney(cart.discount.amount)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <dt className="text-brand-gray">Shipping</dt>
              <dd className="text-brand-gray">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-center justify-between border-t border-brand-light-gray pt-5 font-body">
            <span className="text-[13px] uppercase tracking-[0.12em] text-brand-black">
              Total
            </span>
            <span className="text-[16px] font-medium text-brand-black tabular-nums">
              {cart ? formatMoney(cart.total) : null}
            </span>
          </div>

          <button
            type="button"
            onClick={() => void checkout()}
            disabled={checkingOut}
            className="mt-7 inline-flex w-full items-center justify-center bg-brand-black px-7 py-3.5 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray disabled:opacity-60"
          >
            {checkingOut ? "One moment…" : "Proceed to Checkout"}
          </button>
          <Link
            href="/shop"
            className="mt-4 block text-center font-body text-[12px] uppercase tracking-[0.12em] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
