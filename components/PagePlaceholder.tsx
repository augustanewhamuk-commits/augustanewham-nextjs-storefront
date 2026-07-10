/**
 * Temporary placeholder shell for routes whose real content is built later.
 * Intentionally contains no real copy — structure only (README §4 placeholders).
 * The global Header/Footer will wrap this once those components exist.
 */
export function PagePlaceholder({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      {eyebrow ? (
        <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-wordmark text-3xl font-light uppercase tracking-[0.15em] text-brand-black sm:text-4xl">
        {title}
      </h1>
      <p className="font-body text-sm text-brand-gray">Page coming soon.</p>
    </main>
  );
}
