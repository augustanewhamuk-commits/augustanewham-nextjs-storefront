import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * AI *training* crawlers only — search engines (Googlebot, Bingbot) and
 * user-initiated AI fetchers (e.g. ChatGPT-User) stay allowed, so SEO and
 * "browse this site for me" requests are unaffected.
 *
 * Disabled for now — uncomment the list and the disallow rule below to
 * re-enable blocking of AI training crawlers.
 */
// const AI_TRAINING_BOTS = [
//   "GPTBot",
//   "CCBot",
//   "ClaudeBot",
//   "Bytespider",
//   "Google-Extended",
//   "Applebot-Extended",
//   "meta-externalagent",
//   "Amazonbot",
// ];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // { userAgent: AI_TRAINING_BOTS, disallow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
