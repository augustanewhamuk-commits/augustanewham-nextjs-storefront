"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, User, X } from "lucide-react";
import { navRoutes } from "@/lib/routes";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { CartButton } from "./CartButton";
import { CurrencySelector } from "./CurrencySelector";
import type { CurrencyOption } from "@/lib/currency";

const SHOP_PATH = "/shop";

// Routes that render a full-bleed hero behind the header: the bar goes
// fixed + transparent (white-on-video) until the page is scrolled. Theming
// is handled by the `data-theme` rules in globals.css.
const HERO_ROUTES = new Set<string>([]);

// The header sits in normal page flow and scrolls away with the page; past
// FIX_AT (px) a compact bar slides in, fixed to the viewport top. It slides
// back out below UNFIX_AT — the gap between the two prevents flicker at the
// boundary.
const SCROLL_FIX_AT = 300;
const SCROLL_UNFIX_AT = 240;

const navItemClass =
  "nav-underline inline-flex items-center gap-1 px-1 py-2 font-wordmark text-[13px] uppercase tracking-[0.08em]";

/** A collection link rendered in the Shop dropdown — fed from live Shopify data. */
export type NavCollection = { label: string; path: string };

export function Header({
  collections = [],
  currencies,
  currentCurrency,
}: {
  collections?: NavCollection[];
  /** Distinct currencies for the selector (from Shopify markets). */
  currencies: CurrencyOption[];
  /** The currently selected currency (drives the selector + mobile label). */
  currentCurrency: CurrencyOption;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  const heroRoute = HERO_ROUTES.has(pathname);
  const transparent = heroRoute && !scrolled;

  const openDrawer = () => setOpen(true);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled((current) =>
        window.scrollY > (current ? SCROLL_UNFIX_AT : SCROLL_FIX_AT),
      );
    };
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  // Close the drawer when the route changes (adjust state during render —
  // the React-recommended alternative to an effect for "react to a change").
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // Drawer: scroll lock, focus trap, Escape to close, return focus on close.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const trigger = triggerRef.current;
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  // Live collections rendered as top-level nav items (max 4, from Shopify).
  const collectionNavItems = collections.map((category) => (
    <li key={category.path}>
      <Link
        href={category.path}
        aria-current={isActive(category.path) ? "page" : undefined}
        data-active={isActive(category.path) ? "true" : undefined}
        className={navItemClass}
      >
        {category.label}
      </Link>
    </li>
  ));

  // The primary nav list — shared by the compact and expanded desktop bars.
  // Order: Home, the live collections, then the remaining routes (incl. the
  // Shop dropdown, whose submenu also lists the collections).
  const primaryNav = (
    <ul className="flex flex-wrap items-center justify-center gap-2">
      {navRoutes.map((route) => {
        if (route.path === SHOP_PATH) {
          return (
            <li key={route.path} className="group relative">
              <Link
                href={route.path}
                aria-haspopup="menu"
                data-active={isActive(route.path) ? "true" : undefined}
                className={navItemClass}
              >
                {route.label}
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <ul className="header-submenu invisible absolute left-1/2 top-full z-[70] w-52 -translate-x-1/2 border border-brand-black bg-brand-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                {collections.map((category) => (
                  <li key={category.path}>
                    <Link
                      href={category.path}
                      className={`block px-4 py-3 font-wordmark text-[12px] uppercase tracking-[0.08em] transition-colors hover:bg-brand-off-white ${
                        isActive(category.path) ? "bg-brand-off-white" : ""
                      }`}
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        }
        const routeItem = (
          <li key={route.path}>
            <Link
              href={route.path}
              aria-current={isActive(route.path) ? "page" : undefined}
              data-active={isActive(route.path) ? "true" : undefined}
              className={navItemClass}
            >
              {route.label}
            </Link>
          </li>
        );
        // Surface the live collections right after Home.
        return route.path === "/" ? [routeItem, ...collectionNavItems] : routeItem;
      })}
    </ul>
  );

  // Compact bar row — menu + centred logo on mobile; logo / nav / actions on
  // desktop. Rendered twice: in-flow for mobile, and inside the fixed bar.
  // Only the in-flow menu button carries the focus-return ref.
  const compactRow = (menuRef?: RefObject<HTMLButtonElement | null>) => (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
      {/* Left — menu (mobile only); logo on desktop */}
      <div className="flex items-center justify-self-start">
        <button
          ref={menuRef}
          type="button"
          onClick={openDrawer}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-ml-2 inline-flex p-2 lg:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <Logo showWordmark={false} className="hidden lg:flex" />
      </div>

      {/* Centre — logo (mobile, centred) + desktop navigation */}
      <div className="justify-self-center">
        <Logo showWordmark={false} className="lg:hidden" />
        <nav aria-label="Primary" className="hidden lg:block">
          {primaryNav}
        </nav>
      </div>

      {/* Right — cart (account lives in the drawer on mobile) */}
      <div className="flex items-center gap-2 justify-self-end sm:gap-4">
        <Link
          href="/account"
          aria-label="Account"
          className="hidden p-2 text-brand-black transition-colors hover:text-brand-gray lg:inline-flex"
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </Link>
        <CartButton className="-mr-2" />
      </div>
    </div>
  );

  return (
    <header
      data-theme={transparent ? "transparent" : "solid"}
      className={`${heroRoute ? "fixed inset-x-0 top-0" : "relative"} z-50 transition-colors duration-300 ${transparent ? "bg-transparent" : "bg-brand-white"}`}
    >
      {/* Top utility bar — desktop only (README §5.1) */}
      <div className="hidden border-b border-brand-light-gray md:block">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-5 px-6 py-2 text-[12px] text-brand-gray lg:px-20">
          <SocialLinks iconClassName="h-4 w-4" className="gap-3" />
          <CurrencySelector currencies={currencies} current={currentCurrency} />
        </div>
      </div>

      {/* In-flow header — scrolls away with the page like normal content */}
      <div className="border-b border-brand-light-gray bg-brand-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-20">
          {/* Mobile bar (in flow) */}
          <div className="lg:hidden">{compactRow(triggerRef)}</div>

          {/* Expanded desktop header — big logo + full navigation */}
          <div className="hidden lg:block">
            <div className="relative flex items-center justify-center py-5 lg:py-7">
              <Logo />

              <div className="absolute right-0 flex items-center gap-4">
                <Link
                  href="/account"
                  aria-label="Account"
                  className="inline-flex p-2 text-brand-black transition-colors hover:text-brand-gray"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </Link>
                <CartButton />
              </div>
            </div>

            <nav aria-label="Primary" className="flex justify-center pb-6">
              {primaryNav}
            </nav>
          </div>
        </div>
      </div>

      {/* Fixed compact bar — slides in once the page is scrolled past
          SCROLL_FIX_AT. `invisible` (not just off-screen) while hidden so its
          links can't be tabbed to or clicked. */}
      <div
        className={`fixed inset-x-0 top-0 z-50 border-b border-brand-light-gray bg-brand-white shadow-sm transition-[transform,visibility] duration-300 ease-out ${
          scrolled ? "visible translate-y-0" : "invisible -translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-20">{compactRow()}</div>
      </div>

      {/* Mobile drawer — always mounted so it can animate in and out. */}
        <div
          className={`fixed inset-0 z-[80] transition-opacity duration-300 ease-out lg:hidden ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!open}
        >
          <div
            className={`absolute inset-0 bg-brand-black/40 transition-opacity duration-300 ease-out ${
              open ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className={`absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-brand-white shadow-xl transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-brand-light-gray px-6 py-4">
              <span className="font-wordmark text-[14px] uppercase tracking-[0.15em]">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex p-2"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto py-2">
              <ul>
                <li className="border-b border-brand-light-gray">
                  <Link
                    href="/account"
                    aria-current={isActive("/account") ? "page" : undefined}
                    className="flex w-full items-center gap-3 px-6 py-3 font-wordmark text-[13px] uppercase tracking-[0.08em] text-brand-black"
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    My Account
                  </Link>
                </li>
                {navRoutes.map((route) => {
                  const mobileLink = (label: string, href: string) => (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={isActive(href) ? "page" : undefined}
                        className={`block px-6 py-3 font-wordmark text-[13px] uppercase tracking-[0.08em] ${
                          isActive(href)
                            ? "underline decoration-1 underline-offset-[6px]"
                            : ""
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                  const item = mobileLink(route.label, route.path);
                  // Surface the live collections right after Home.
                  return route.path === "/"
                    ? [item, ...collections.map((c) => mobileLink(c.label, c.path))]
                    : item;
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-4 border-t border-brand-light-gray px-6 py-4 text-[12px] text-brand-gray">
              <SocialLinks iconClassName="h-5 w-5" />
              <span>
                {currentCurrency.label} — {currentCurrency.currencyCode}
              </span>
            </div>
          </div>
        </div>
    </header>
  );
}
