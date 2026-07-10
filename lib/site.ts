/**
 * Central site configuration — single source of truth for SEO metadata,
 * structured data, sitemap, robots and the web manifest.
 * No env vars (static prototype). Domain per README §1.
 */
export const site = {
  name: "Augusta Newham",
  shortName: "Augusta Newham",
  url: "https://augustanewham.com",
  locale: "en_GB",
  language: "en-GB",
  email: "contactus@augustanewham.com",
  tagline: "Lingerie & Shapewear",
  description:
    "Our staple and basewear are designed in fabrics which gives comfort and shades that celebrate every skin tone. Shop our bralettes, bodysuits, shapewear and high waist briefs.",
  social: {
    instagram: "https://www.instagram.com/augustanewham",
    facebook: "https://www.facebook.com/augustanewham",
    tiktok: "#",
    amazon:
      "https://www.amazon.co.uk/stores/page/93B0D03A-02C7-44E5-9379-D3D78F132921?ingress=2&lp_context_asin=B0GSXC4JVZ&visitId=e1b13b35-6d94-43cb-8768-da80ee8757a5&ref_=ast_bln",
  },
} as const;

/** Confirmed external profiles for schema.org `sameAs`. */
export const sameAs: string[] = Object.values(site.social).filter(
  (url) => url.length > 0 && url !== "#",
);
