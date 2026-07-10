"use client";

import { useRef, useState } from "react";

/**
 * "Find your nude" — the brand's real nude range, light to deep. On a monochrome
 * page the skin tones are the only colour. Desktop: panels expand on hover and a
 * frosted glass "lens" follows the cursor; mobile: a snapping scroller. The live
 * readout shows the hovered/selected shade's name, colour ref and note.
 */
const SHADES = [
  {
    name: "Cream",
    hex: "#FDFBD4",
    note: "Our lightest base — for fair and porcelain skin.",
  },
  {
    name: "Light Beige",
    hex: "#EDC9AF",
    note: "A soft neutral for light to medium skin.",
  },
  {
    name: "Dark Beige",
    hex: "#A67B5B",
    note: "A warm tan for medium to deep skin.",
  },
  {
    name: "Chocolate",
    hex: "#663300",
    note: "A rich, deep brown for deep skin tones.",
  },
];

/** True for light swatches that need dark text. */
function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

export function ShadeRange() {
  const [active, setActive] = useState(1);
  const [hovering, setHovering] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const bandRef = useRef<HTMLDivElement>(null);

  const shade = SHADES[active];

  const onMove = (e: React.MouseEvent) => {
    const rect = bandRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section className="bg-brand-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-xl">
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-gray">
            The Range
          </p>
          <h2 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.08em] text-brand-black sm:text-4xl">
            Find your nude
          </h2>
          <p className="mt-4 max-w-md font-body text-base leading-relaxed text-brand-gray">
            A base made in shades for every skin tone — so it disappears on your
            skin, not on someone else&apos;s.
          </p>
        </div>

        {/* Live readout of the active shade */}
        <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-brand-light-gray pt-4">
          <span className="font-wordmark text-sm uppercase tracking-[0.1em] text-brand-black">
            {shade.name}
          </span>
          <span className="font-body text-[12px] uppercase tracking-[0.08em] text-brand-gray tabular-nums">
            {shade.hex}
          </span>
          <span className="font-body text-sm text-brand-gray">
            — {shade.note}
          </span>
        </div>

        {/* Swatch band */}
        <div
          ref={bandRef}
          onMouseMove={onMove}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="relative mt-5 flex h-64 snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1 sm:h-80 lg:cursor-none lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SHADES.map((s, i) => {
            const dark = !isLight(s.hex);
            return (
              <button
                key={s.name}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                aria-label={`${s.name} (${s.hex})`}
                style={{ backgroundColor: s.hex }}
                className={`group relative flex w-[44%] shrink-0 snap-start items-end overflow-hidden transition-[flex-grow,width] duration-500 ease-out sm:w-[28%] lg:w-auto lg:flex-1 lg:cursor-none ${
                  active === i ? "lg:flex-[2.4]" : ""
                }`}
              >
                <span
                  className={`relative z-10 p-3 font-wordmark text-[11px] uppercase tracking-[0.14em] sm:p-4 ${
                    dark ? "text-brand-white" : "text-brand-black"
                  }`}
                >
                  {s.name}
                </span>
              </button>
            );
          })}

          {/* Frosted glass cursor lens (desktop) */}
          <div
            aria-hidden="true"
            style={{
              left: pos.x,
              top: pos.y,
              opacity: hovering ? 1 : 0,
            }}
            className="pointer-events-none absolute z-30 hidden h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/50 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-opacity duration-200 lg:flex"
          >
            <span className="font-wordmark text-[11px] uppercase tracking-[0.1em] text-white mix-blend-difference">
              {shade.name}
            </span>
            <span className="font-body text-[10px] tracking-wide text-white mix-blend-difference">
              {shade.hex}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
