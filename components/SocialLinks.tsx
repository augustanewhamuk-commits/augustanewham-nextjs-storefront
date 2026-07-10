import { site } from "@/lib/site";
import { AmazonIcon, FacebookIcon, InstagramIcon, TikTokIcon } from "./BrandIcons";

const socials = [
  { label: "Instagram", href: site.social.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: site.social.facebook, Icon: FacebookIcon },
  { label: "TikTok", href: site.social.tiktok, Icon: TikTokIcon },
  { label: "Amazon", href: site.social.amazon, Icon: AmazonIcon },
];

/** Reusable row of social links — used in the header utility bar and footer. */
export function SocialLinks({
  className = "",
  iconClassName = "h-5 w-5",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <ul className={`flex items-center gap-4 ${className}`}>
      {socials.map(({ label, href, Icon }) => {
        const external = href.startsWith("http");
        return (
          <li key={label}>
            <a
              href={href}
              aria-label={label}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="inline-flex text-brand-black transition-colors hover:text-brand-gray"
            >
              <Icon className={iconClassName} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
