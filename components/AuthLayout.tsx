/**
 * Shared centered shell for the auth screens (login / register / password).
 * Server component — purely presentational.
 */
export function AuthLayout({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 py-16 lg:py-24">
      <header className="mb-8 text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black">
          {title}
        </h1>
      </header>
      <div className="border border-brand-light-gray p-7 sm:p-9">{children}</div>
    </main>
  );
}
