import Link from "next/link";
import { footerRoutes } from "@/lib/routes";
import { site } from "@/lib/site";
import { BrandMark } from "./BrandMark";
import { NewsletterForm } from "./NewsletterForm";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-light-gray bg-brand-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-20 lg:py-[60px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand — logo + description */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={`${site.name} — home`}
              className="inline-flex flex-col gap-1.5 text-brand-black"
            >
              <BrandMark className="h-10 w-auto" />
              <span className="font-wordmark text-[18px] uppercase leading-none tracking-[0.15em]">
                {site.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-brand-gray">
              {site.description}
            </p>
          </div>

          {/* Policy links */}
          <nav aria-label="Footer">
            <ul className="space-y-1 text-[13px] leading-[2] text-brand-gray">
              {footerRoutes.map((route) => (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    className="transition-colors hover:text-brand-black"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right — newsletter signup (Shopify subscriber = 10% off) + socials */}
          <div className="w-full md:ml-auto md:max-w-md">
            <h2 className="font-wordmark text-[13px] uppercase tracking-[0.2em] text-brand-black">
              Sign up and save
            </h2>
            <p className="mt-3 text-[13px] text-brand-gray">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>

            <NewsletterForm />

            <SocialLinks className="mt-6" iconClassName="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-brand-light-gray">
        <div className="mx-auto max-w-[1400px] px-6 py-5 lg:px-20">
          <p className="text-[12px] text-brand-gray">
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
