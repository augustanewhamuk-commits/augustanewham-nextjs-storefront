"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { variantImage } from "@/lib/products";
import { addToCart, openCart } from "@/lib/cart";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/currency";
import { ProductShot } from "./ProductShot";

/**
 * Interactive product tile: colour swatches that swap the photo + a Quick Add
 * that reveals size chips, so visitors can pick a variant and add to cart
 * without leaving the listing. Reachable by tap on touch screens.
 */
export function ProductCard({
  product,
  preferredColor,
}: {
  product: Product;
  /** When set, the card defaults to this colour if the product has it. */
  preferredColor?: string;
}) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);
  /** The size currently being added — drives the busy state on its chip. */
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selecting a colour in the shop filter switches matching products to it;
  // products without that colour are left on their current variant.
  useEffect(() => {
    if (!preferredColor) return;
    const idx = product.variants.findIndex((v) => v.color === preferredColor);
    if (idx >= 0) setVariantIndex(idx);
  }, [preferredColor, product.variants]);

  const variant = product.variants[variantIndex];
  // Prefer real photos: show the first available view (front → side → back),
  // and the next available one on hover. Fall back to the first (placeholder)
  // entry only when the variant has no photography at all.
  const shots = variant.images.filter((img) => img.src);
  const primary = shots[0] ?? variant.images[0];
  const hoverImage = shots[1];
  const cartImage = variantImage(variant);

  const quickAdd = async (size: string) => {
    if (adding) return;
    setAdding(size);
    setError(null);
    const result = await addToCart({
      handle: product.slug,
      color: variant.color,
      size,
      quantity: 1,
    });
    setAdding(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPicking(false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    flyToCart(cartImage, imageRef.current, { onLand: openCart });
  };

  return (
    <div className="group">
      <div
        ref={imageRef}
        className="relative aspect-[3/4] overflow-hidden bg-brand-light-gray"
      >
        <ProductShot
          key={primary.src ?? primary.view}
          image={primary}
          alt={`${product.name} — ${variant.color}`}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {hoverImage?.src ? (
          <Image
            key={hoverImage.src}
            src={hoverImage.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
        ) : null}

        <Link
          href={`/product/${product.slug}`}
          aria-label={product.name}
          className="absolute inset-0 z-10"
        />

        {picking ? (
          <div className="absolute inset-x-2 bottom-2 z-20 bg-brand-white/95 p-2 shadow-md backdrop-blur-sm">
            <div className="flex items-center justify-between px-1 pb-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-brand-gray">
                {adding ? "Adding…" : `${variant.color} · Select size`}
              </span>
              <button
                type="button"
                onClick={() => setPicking(false)}
                aria-label="Close size picker"
                className="inline-flex p-0.5 text-brand-gray hover:text-brand-black"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {variant.sizes.map((size) => {
                const busy = adding === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => quickAdd(size)}
                    disabled={adding !== null}
                    aria-busy={busy}
                    className={`min-w-8 border px-2 py-1.5 font-body text-[12px] uppercase transition-colors disabled:cursor-wait ${
                      busy
                        ? "animate-pulse border-brand-black bg-brand-black text-brand-white"
                        : "border-brand-light-gray text-brand-black hover:border-brand-black hover:bg-brand-black hover:text-brand-white disabled:opacity-40"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {error ? (
              <p className="px-1 pt-1.5 font-body text-[10px] leading-snug text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="absolute inset-x-2 bottom-2 z-20 flex translate-y-0 items-center justify-center gap-1.5 bg-brand-white/95 py-2.5 font-wordmark text-[11px] uppercase tracking-[0.12em] text-brand-black opacity-100 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-brand-black hover:text-brand-white lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Quick Add
              </>
            )}
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="mt-3">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-brand-gray">
          {product.category}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h3 className="font-wordmark text-[13px] uppercase tracking-[0.06em] text-brand-black">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <span className="shrink-0 font-body text-[13px] text-brand-black tabular-nums">
            {formatPrice(product.price, product.currencyCode)}
          </span>
        </div>

        {/* Colour swatches */}
        <div className="mt-2.5 flex items-center gap-1.5">
          {product.variants.map((v, i) => (
            <button
              key={v.color}
              type="button"
              onMouseEnter={() => setVariantIndex(i)}
              onClick={() => setVariantIndex(i)}
              aria-label={v.color}
              aria-pressed={i === variantIndex}
              title={v.color}
              className={`h-4 w-4 rounded-full border transition-all ${
                i === variantIndex
                  ? "border-brand-black ring-1 ring-brand-black ring-offset-1"
                  : "border-brand-light-gray hover:border-brand-gray"
              }`}
              style={{ backgroundColor: v.hex }}
            />
          ))}
          <span className="ml-1 font-body text-[11px] text-brand-gray">
            {variant.color}
          </span>
        </div>
      </div>
    </div>
  );
}
