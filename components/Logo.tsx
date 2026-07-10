import Link from "next/link";
import { site } from "@/lib/site";
import { BrandMark } from "./BrandMark";

/**
 * Brand logo: the &N monogram artwork above the wordmark, centred (README §3.3).
 */
type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className = "", showWordmark = true }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`flex flex-col items-center gap-1.5 text-brand-black ${className}`}
    >
      <BrandMark className="h-9 w-auto lg:h-11" />
      {showWordmark ? (
        <span className="hidden text-center font-wordmark text-[18px] uppercase leading-none tracking-[0.15em] lg:block lg:text-[22px]">
          {site.name}
        </span>
      ) : null}
    </Link>
  );
}
