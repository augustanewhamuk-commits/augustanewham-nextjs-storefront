import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center lg:py-32">
      <p className="font-body text-[11px] uppercase tracking-[0.3em] text-brand-gray">
        Error 404
      </p>
      <h1 className="mt-4 font-wordmark text-5xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-6 max-w-md font-body text-sm leading-relaxed text-brand-gray">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        It may have sold out, been renamed, or never existed at all.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-brand-black px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray"
        >
          Shop all
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-brand-black px-8 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
