"use client";

import { useSyncExternalStore } from "react";
import { ShoppingBag } from "lucide-react";
import {
  cartCount,
  getCartServerSnapshot,
  getCartSnapshot,
  openCart,
  subscribeCart,
} from "@/lib/cart";

/** Cart icon with a live item-count badge. Opens the cart drawer on click. */
export function CartButton({ className = "" }: { className?: string }) {
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const count = cartCount(cart);

  return (
    <button
      type="button"
      onClick={openCart}
      data-cart-fly-target
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      aria-haspopup="dialog"
      className={`relative inline-flex p-2 text-brand-black transition-colors hover:text-brand-gray ${className}`}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-black px-1 font-body text-[10px] font-medium leading-none text-brand-white"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
