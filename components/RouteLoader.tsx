"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";

/**
 * Route loader.
 *
 * Behaviour:
 *  - A navigation starts (link click, back/forward, or a still-loading reload).
 *  - If the next page arrives within SHOW_DELAY, nothing is ever shown — fast
 *    pages don't get a loader flash.
 *  - If it takes longer, the brand logo fades in and keeps drawing itself on a
 *    loop while the page loads.
 *  - When the page is ready, it plays ONE quick final draw (so the logo always
 *    finishes) and then disappears.
 */

const SHOW_DELAY = 900; // ms — navigations faster than this never show the loader
const MAX_WAIT = 8000; // ms — safety net so the loader can never get stuck

// Routes that render their own loading.tsx skeleton. For these we suppress the
// brand-logo overlay so the page-specific skeleton shows through instead.
const SKELETON_ROUTES = new Set([
  "/shop",
  "/cart",
  "/account",
  "/bralette",
  "/bodysuit",
  "/high-waist-brief",
  "/shapewear",
]);
function prefersSkeleton(path: string) {
  return (
    path.startsWith("/product/") ||
    path.startsWith("/collections/") ||
    SKELETON_ROUTES.has(path)
  );
}

type Status = "hidden" | "loop" | "finish";

export function RouteLoader() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("hidden");

  const loadingRef = useRef(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const firstPath = useRef(true);

  const end = useCallback(() => {
    if (!loadingRef.current) return;
    loadingRef.current = false;
    if (showTimer.current) clearTimeout(showTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    // Visible -> play the fast final draw. Still within the delay window -> just stay hidden.
    setStatus((s) => (s === "loop" ? "finish" : "hidden"));
  }, []);

  const begin = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (showTimer.current) clearTimeout(showTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    showTimer.current = setTimeout(() => setStatus("loop"), SHOW_DELAY);
    safetyTimer.current = setTimeout(end, MAX_WAIT);
  }, [end]);

  // The route committed (pathname changed) => the new page is ready.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    end();
  }, [pathname, end]);

  // Safety net for the final draw: onAnimationEnd normally hides the overlay,
  // but with reduced motion the finish animation is disabled and never fires.
  // This guarantees the overlay always goes away after the finish window.
  useEffect(() => {
    if (status !== "finish") return;
    const t = setTimeout(() => setStatus((s) => (s === "finish" ? "hidden" : s)), 600);
    return () => clearTimeout(t);
  }, [status]);

  // Start detection: link clicks, back/forward, and a reload that's still fetching.
  useEffect(() => {
    let onLoad: (() => void) | undefined;
    if (document.readyState !== "complete" && !prefersSkeleton(location.pathname)) {
      begin();
      onLoad = () => end();
      window.addEventListener("load", onLoad);
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return; // external link
      if (url.pathname === location.pathname && url.search === location.search) {
        return; // same page (e.g. hash only)
      }
      if (prefersSkeleton(url.pathname)) return; // let the page skeleton show
      begin();
    };

    // On back/forward the URL has already changed, so location is the destination.
    const onPop = () => {
      if (prefersSkeleton(location.pathname)) return;
      begin();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      if (onLoad) window.removeEventListener("load", onLoad);
      if (showTimer.current) clearTimeout(showTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, [begin, end]);

  if (status === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="brand-overlay fixed inset-0 z-[100] flex items-center justify-center bg-brand-white"
    >
      <BrandMark
        key={status} // remount on loop -> finish so the final draw restarts cleanly
        variant="draw"
        className={`h-28 w-auto text-brand-black sm:h-36 ${
          status === "loop" ? "brand-draw-loop" : "brand-draw-once"
        }`}
        onAnimationEnd={
          status === "finish"
            ? () => setStatus((s) => (s === "finish" ? "hidden" : s))
            : undefined
        }
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
