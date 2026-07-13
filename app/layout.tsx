import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { getCatalogCollections } from "@/lib/catalog";
import { getMarkets } from "@/lib/country";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SmoothScroll } from "@/components/SmoothScroll";
import {
  organizationSchema,
  websiteSchema,
  siteNavigationSchema,
} from "@/lib/structured-data";


// Body text — README §3.2
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Body font — Switzer (loaded locally)
const switzer = localFont({
  src: [
    { path: "./fonts/switzer/Switzer-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/switzer/Switzer-Italic.otf", weight: "400", style: "italic" },
    { path: "./fonts/switzer/Switzer-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/switzer/Switzer-Semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/switzer/Switzer-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

// Wordmark / nav — Copperplate Gothic Light (README §3.2)
const copperplate = localFont({
  src: "./fonts/copperplate-gothic-light.ttf",
  variable: "--font-copperplate",
  display: "swap",
  weight: "400",
});

const titleDefault = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: titleDefault,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "shopping",
  alternates: { canonical: "/" },
  keywords: [
    "lingerie",
    "shapewear",
    "bralette",
    "bodysuit",
    "high waist brief",
    "Augusta Newham",
    "every skin tone",
  ],
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { title: site.name },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: titleDefault,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: titleDefault,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Live Shopify collections drive the Shop dropdown (max 4); Shopify markets
  // drive the currency selector (auto-detected country, user override via cookie).
  const [collections, markets] = await Promise.all([
    getCatalogCollections(4),
    getMarkets(),
  ]);
  const navCollections = collections.map((c) => ({ label: c.title, path: c.path }));

  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${switzer.variable} ${copperplate.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-white text-brand-black">
        <JsonLd
          data={[
            organizationSchema(),
            websiteSchema(),
            ...siteNavigationSchema(),
          ]}
        />
        <SmoothScroll />
        <Header
          collections={navCollections}
          currencies={markets.currencies}
          currentCurrency={markets.current}
        />
        {children}
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
