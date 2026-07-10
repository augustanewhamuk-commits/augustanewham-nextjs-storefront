import type { ReactNode } from "react";

/**
 * Shared shell for long-form legal / policy pages (terms, privacy, …).
 * Children are plain semantic markup styled by the `.legal-prose` rules
 * in globals.css.
 */
export function LegalLayout({
  eyebrow = "Legal",
  title,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 lg:py-20">
      <header className="mb-10 border-b border-brand-light-gray pb-8">
        <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-wordmark text-3xl font-light uppercase tracking-[0.15em] text-brand-black sm:text-4xl">
          {title}
        </h1>
        {updated ? (
          <p className="mt-4 font-body text-xs text-brand-gray">
            Last updated: {updated}
          </p>
        ) : null}
      </header>

      <div className="legal-prose">{children}</div>
    </main>
  );
}
