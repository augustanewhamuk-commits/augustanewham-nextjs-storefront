import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Shopify-hosted product/variant images (used in the cart line items).
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
    // The local "coming soon" placeholder is an SVG; allow next/image to serve
    // it. Locked down with a strict CSP since it's a trusted first-party asset.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Force HTTPS for two years once a browser has seen the site.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          // Never MIME-sniff responses into executable types.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Anti-clickjacking: the shop never needs to be iframed.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Send only the origin to third parties (e.g. Shopify checkout).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site uses none of these browser features.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
