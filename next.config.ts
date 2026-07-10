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
};

export default nextConfig;
