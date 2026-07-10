"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Inclusive-sizing statement as a measuring-tape ruler. On scroll-in the ticks
 * sweep in one after another and the size counts up from XXS to 8XL. The tape
 * then stays interactive: lines rest at 50% and light up + scale on hover, with
 * the marker and the big readout tracking whichever line you're on.
 */
const SIZES = [
  "XXS", "XS", "S", "M", "L", "XL",
  "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL",
];
const MINOR = 4; // sub-divisions between each labelled size
const TICKS = (SIZES.length - 1) * MINOR; // last tick index

export function SizeRange() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // Count up through the sizes once the section is on screen.
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1;
      setCount(i);
      if (i < SIZES.length - 1) timer = setTimeout(step, reduce ? 0 : 110);
    };
    timer = setTimeout(step, reduce ? 0 : 350);
    return () => clearTimeout(timer);
  }, [inView, reduce]);

  const hoveredSize = hovered !== null ? Math.round(hovered / MINOR) : null;
  const displaySize = hoveredSize !== null ? SIZES[hoveredSize] : SIZES[count];
  const markerLeft =
    hovered !== null
      ? (hovered / TICKS) * 100
      : (count / (SIZES.length - 1)) * 100;

  return (
    <section ref={ref} className="bg-brand-black text-brand-white">
      <div className="mx-auto max-w-[1100px] px-6 py-24 text-center lg:py-32">
        <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-white/55">
          Inclusive sizing
        </p>

        {/* Readout */}
        <div className="mt-6 flex h-16 items-center justify-center sm:h-24">
          <span className="font-wordmark text-5xl font-light uppercase tracking-[0.05em] sm:text-7xl">
            {displaySize}
          </span>
        </div>

        {/* Ruler / measuring tape */}
        <div
          className="relative mx-auto mt-4 h-36 w-full max-w-[900px]"
          onMouseLeave={() => setHovered(null)}
        >
          {/* Baseline (faint track + drawn-in line) */}
          <div className="absolute inset-x-0 top-8 h-px bg-brand-white/20" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-8 h-px origin-left bg-brand-white/40"
          />

          {/* Ticks — longer lines, rest at 50%, light + scale on hover */}
          {Array.from({ length: TICKS + 1 }).map((_, i) => {
            const major = i % MINOR === 0;
            const isHover = hovered === i;
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onMouseEnter={() => setHovered(i)}
                style={{ left: `${(i / TICKS) * 100}%`, width: `${100 / TICKS}%` }}
                className="absolute top-8 flex h-16 -translate-x-1/2 cursor-pointer justify-center"
              >
                {/* reveal wrapper (staggered grow-in) */}
                <span
                  style={{
                    transform: `scaleY(${inView ? 1 : 0})`,
                    opacity: inView ? 1 : 0,
                    transitionDelay: `${reduce ? 0 : i * 12}ms`,
                  }}
                  className="origin-top transition-all duration-300 ease-out"
                >
                  {/* the line itself (hover light + scale) */}
                  <span
                    style={{
                      transform: `scaleY(${isHover ? 1.5 : 1})`,
                      opacity: isHover ? 1 : 0.5,
                    }}
                    className={`block w-px origin-top bg-brand-white transition-all duration-200 ease-out ${
                      major ? "h-16" : "h-8"
                    }`}
                  />
                </span>
              </button>
            );
          })}

          {/* Size labels under the major ticks */}
          {SIZES.map((size, i) => {
            const active = i <= count || hoveredSize === i;
            return (
              <motion.span
                key={size}
                initial={{ opacity: 0, y: 6 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: reduce ? 0 : i * MINOR * 0.012 + 0.1, duration: 0.3 }}
                style={{ left: `${(i / (SIZES.length - 1)) * 100}%` }}
                className={`pointer-events-none absolute top-[6.5rem] -translate-x-1/2 font-body text-[9px] uppercase tracking-[0.06em] transition-colors duration-200 sm:text-[11px] ${
                  active ? "text-brand-white" : "text-brand-white/35"
                }`}
              >
                {size}
              </motion.span>
            );
          })}

          {/* Travelling marker */}
          <div
            className="pointer-events-none absolute top-2 -translate-x-1/2 transition-[left] duration-150 ease-out"
            style={{ left: `${markerLeft}%` }}
          >
            <div className="h-0 w-0 border-x-4 border-t-[7px] border-x-transparent border-t-brand-white" />
          </div>
        </div>

        <h2 className="mx-auto mt-10 max-w-2xl font-wordmark text-3xl font-light uppercase leading-[1.12] tracking-[0.06em] sm:text-5xl">
          Shaped for every figure
        </h2>
        <p className="mx-auto mt-5 max-w-md font-body text-base leading-relaxed text-brand-white/80">
          From a perfect XXS to a confident 8XL — a base made for every body, in
          a shade for every skin tone.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-brand-white px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-white/85"
          >
            Shop the collection
          </Link>
          <Link
            href="/size-guide"
            className="inline-flex items-center justify-center border border-brand-white/60 px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-white hover:text-brand-black"
          >
            Size guide
          </Link>
        </div>
      </div>
    </section>
  );
}
