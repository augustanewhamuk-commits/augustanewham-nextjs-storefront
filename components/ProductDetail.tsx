"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Maximize2, Minus, Plus } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import type { Product } from "@/lib/products";
import { variantImage } from "@/lib/products";
import { addToCart, openCart } from "@/lib/cart";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/currency";
import { ProductShot } from "./ProductShot";

/** Shipping & returns summary (kept in sync with /returns-refund-shipping). */
const INFO = [
  {
    id: "shipping",
    title: "Shipping",
    body: "We ship nationally and internationally. Orders are dispatched within 1–2 business days and delivery times vary by destination. Shipping is calculated at checkout.",
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    body: "Return within 30 days of your order for a refund. Items must be unworn, unwashed and have their tags attached. Email us with your order number and we'll reply within 2 business days with the return address. A return shipping fee is deducted from your refund.",
  },
];

export function ProductDetail({ product }: { product: Product }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [openInfo, setOpenInfo] = useState<string | null>("shipping");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const variant = product.variants[variantIndex];
  const cartImage = variantImage(variant);
  // The lightbox can only show real photos; placeholders are skipped.
  const realImages = variant.images.filter((img) => img.src);
  const slides = realImages.map((img) => ({ src: encodeURI(img.src!) }));
  const activeShot = variant.images[activeImage];
  const lightboxIndex = realImages.indexOf(activeShot);
  const canZoom = lightboxIndex >= 0;

  const selectVariant = (i: number) => {
    setVariantIndex(i);
    setActiveImage(0);
    setSize(null);
  };

  const handleAddToCart = async () => {
    if (!size || adding) return;
    setAdding(true);
    setCartError(null);
    const result = await addToCart({
      handle: product.slug,
      color: variant.color,
      size,
      quantity,
    });
    setAdding(false);
    if (!result.ok) {
      setCartError(result.error);
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    flyToCart(cartImage, addButtonRef.current, { onLand: openCart });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => canZoom && setLightboxOpen(true)}
          aria-label="Open image gallery"
          disabled={!canZoom}
          className={`group relative aspect-[3/4] overflow-hidden bg-brand-light-gray ${
            canZoom ? "cursor-zoom-in" : "cursor-default"
          }`}
        >
          <ProductShot
            key={activeShot.src ?? activeShot.view}
            image={activeShot}
            alt={`${product.name} — ${variant.color}`}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          {canZoom ? (
            <span className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center bg-brand-white/90 text-brand-black opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
        </button>
        <div className="flex gap-3">
          {variant.images.map((image, i) => (
            <button
              key={image.src ?? image.view}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`View ${image.view}`}
              aria-current={i === activeImage}
              className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-brand-light-gray transition-opacity ${
                i === activeImage
                  ? "ring-1 ring-brand-black"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <ProductShot image={image} alt="" sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="lg:py-2">
        <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
          {product.category}
        </p>
        <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.08em] text-brand-black sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 font-body text-[15px] text-brand-gray">
          {product.tagline}
        </p>
        <p className="mt-5 font-body text-xl text-brand-black tabular-nums">
          {formatPrice(product.price, product.currencyCode)}
        </p>

        {/* Colour */}
        <div className="mt-8">
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-brand-gray">
            Colour: <span className="text-brand-black">{variant.color}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.variants.map((v, i) => (
              <button
                key={v.color}
                type="button"
                onClick={() => selectVariant(i)}
                aria-label={v.color}
                aria-pressed={i === variantIndex}
                title={v.color}
                className={`h-8 w-8 rounded-full border transition-all ${
                  i === variantIndex
                    ? "border-brand-black ring-1 ring-brand-black ring-offset-2"
                    : "border-brand-light-gray hover:border-brand-gray"
                }`}
                style={{ backgroundColor: v.hex }}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-brand-gray">
              Size
            </p>
            <Link
              href="/size-guide"
              className="font-body text-[12px] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
            >
              Size guide
            </Link>
          </div>
          {variant.sizes.length === 0 ? (
            <p className="mt-3 font-body text-[13px] text-brand-gray">
              This colour is currently sold out.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {variant.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                  className={`min-w-12 border px-3 py-2 font-body text-[13px] uppercase tracking-[0.06em] transition-colors ${
                    s === size
                      ? "border-brand-black bg-brand-black text-brand-white"
                      : "border-brand-light-gray text-brand-black hover:border-brand-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity + add */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center border border-brand-light-gray">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="inline-flex p-3 text-brand-black transition-colors hover:bg-brand-off-white"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="min-w-8 text-center font-body text-[14px] tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="inline-flex p-3 text-brand-black transition-colors hover:bg-brand-off-white"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <button
            ref={addButtonRef}
            type="button"
            onClick={handleAddToCart}
            disabled={!size || adding}
            className="inline-flex flex-1 items-center justify-center gap-2 bg-brand-black px-8 py-3.5 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray disabled:cursor-not-allowed disabled:bg-brand-gray/50"
          >
            {adding ? (
              "Adding…"
            ) : added ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Added
              </>
            ) : variant.sizes.length === 0 ? (
              "Sold Out"
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
        {!size && variant.sizes.length > 0 ? (
          <p className="mt-3 font-body text-[12px] text-brand-gray">
            Please select a size.
          </p>
        ) : null}
        {cartError ? (
          <p className="mt-3 font-body text-[12px] text-red-700">{cartError}</p>
        ) : null}

        {/* Description + details */}
        <div className="mt-10 border-t border-brand-light-gray pt-8">
          <p className="font-body text-[15px] leading-relaxed text-brand-gray">
            {product.description}
          </p>
          <ul className="mt-6 space-y-2">
            {product.details.map((detail) => (
              <li
                key={detail}
                className="flex gap-2.5 font-body text-[14px] text-brand-black"
              >
                <span aria-hidden="true" className="text-brand-gray">
                  —
                </span>
                {detail}
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-1 font-body text-[13px]">
            <div className="flex gap-2">
              <dt className="text-brand-gray">Composition:</dt>
              <dd className="text-brand-black">{product.composition}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-brand-gray">Care:</dt>
              <dd className="text-brand-black">{product.care}</dd>
            </div>
          </dl>
        </div>

        {/* Shipping & returns */}
        <div className="mt-8 border-t border-brand-light-gray">
          {INFO.map((item) => {
            const isOpen = openInfo === item.id;
            return (
              <div key={item.id} className="border-b border-brand-light-gray">
                <button
                  type="button"
                  onClick={() => setOpenInfo(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left font-wordmark text-[13px] uppercase tracking-[0.08em] text-brand-black"
                >
                  {item.title}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <p className="pb-5 font-body text-[14px] leading-relaxed text-brand-gray">
                    {item.body}
                  </p>
                ) : null}
              </div>
            );
          })}
          <Link
            href="/returns-refund-shipping"
            className="mt-4 inline-block font-body text-[12px] uppercase tracking-[0.08em] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
          >
            Full returns &amp; shipping policy
          </Link>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={Math.max(0, lightboxIndex)}
        slides={slides}
        on={{
          view: ({ index }) =>
            setActiveImage(variant.images.indexOf(realImages[index])),
        }}
        plugins={[Thumbnails, Zoom, Counter]}
        carousel={{ finite: true }}
        thumbnails={{ width: 80, height: 100, border: 1, gap: 8 }}
        styles={{ container: { backgroundColor: "rgba(0,0,0,0.92)" } }}
      />
    </div>
  );
}
