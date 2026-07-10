"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Site-wide smooth scrolling (Lenis). Lenis drives the real document scroll,
 * so native scroll events and `window.scrollY` still work — the sticky/fixed
 * Header and the contact globe keep behaving normally. Disabled for visitors
 * who prefer reduced motion, and on touch devices — on phones/tablets the
 * native momentum scroll is smoother, and Lenis only adds jank there.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch devices: leave native scrolling alone.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
