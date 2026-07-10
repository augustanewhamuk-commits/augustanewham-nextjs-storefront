"use client";

// import { useMemo, useState } from "react"; // for the colour picker (disabled for now)
import Image from "next/image";
import Link from "next/link";
import type { CategorySwatch } from "@/lib/products";
import { PLACEHOLDER_IMAGE } from "@/lib/products";
import { Reveal } from "./Reveal";

export type BaseTile = {
  label: string;
  href: string;
  /** Explicit default cover image; falls back to the first swatch image. */
  cover?: string;
  swatches: CategorySwatch[];
};

/**
 * Homepage "Find your base" grid with a single shared colour picker beneath the
 * heading. Choosing a colour switches every category that offers it to that
 * colour; categories without it keep their default image.
 */
export function FindYourBase({ categories }: { categories: BaseTile[] }) {
  // Colour picker disabled for now — each cover just shows its default image.
  // const [selected, setSelected] = useState<string | null>(null);
  //
  // // Unique colours across all categories, for the shared picker row.
  // const colors = useMemo(() => {
  //   const seen = new Map<string, { color: string; hex: string }>();
  //   for (const cat of categories) {
  //     for (const s of cat.swatches) {
  //       if (!seen.has(s.color)) seen.set(s.color, { color: s.color, hex: s.hex });
  //     }
  //   }
  //   return [...seen.values()];
  // }, [categories]);

  // Default cover image for each category.
  const imageFor = (cat: BaseTile) =>
    cat.cover ?? cat.swatches[0]?.image ?? PLACEHOLDER_IMAGE;

  return (
    <>
      {/* Shared colour picker — disabled for now */}
      {/* {colors.length > 0 ? (
        <Reveal className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-body text-[11px] uppercase tracking-[0.2em] text-brand-gray">
            Colour
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-pressed={selected === null}
            className={`px-2 py-1 font-body text-[11px] uppercase tracking-[0.08em] transition-colors ${
              selected === null
                ? "text-brand-black underline decoration-1 underline-offset-4"
                : "text-brand-gray hover:text-brand-black"
            }`}
          >
            All
          </button>
          {colors.map((c) => (
            <button
              key={c.color}
              type="button"
              onClick={() => setSelected(c.color)}
              aria-label={c.color}
              aria-pressed={selected === c.color}
              title={c.color}
              className={`h-5 w-5 rounded-full border transition-all ${
                selected === c.color
                  ? "border-brand-black ring-1 ring-brand-black ring-offset-1"
                  : "border-brand-light-gray hover:border-brand-gray"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {selected ? (
            <span className="ml-1 font-body text-[11px] text-brand-gray">
              {selected}
            </span>
          ) : null}
        </Reveal>
      ) : null} */}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <Reveal key={cat.href} delay={i * 0.08}>
            <Link href={cat.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-brand-light-gray">
                <Image
                  key={imageFor(cat)}
                  src={imageFor(cat)}
                  alt={cat.label}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 bg-brand-black/5 transition-colors duration-300 group-hover:bg-brand-black/20"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-wordmark text-[13px] uppercase tracking-[0.1em] text-brand-black">
                  {cat.label}
                </span>
                <span
                  className="font-body text-[12px] text-brand-gray transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
