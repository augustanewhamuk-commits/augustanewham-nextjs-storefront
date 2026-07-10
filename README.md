# Augusta Newham —  Storefront

E-commerce storefront for [Augusta Newham](https://augustanewham.com), a UK-based lingerie and shapewear brand. Built with Next.js (App Router) and powered by the Shopify Storefront API for products, cart, checkout and customer accounts.

Developed and maintained by Lumo Group.
---

## Features

- **Shopify-powered catalogue** — products, collections, pricing and inventory fetched live from the Shopify Storefront API
- **Cart & checkout** — server-side cart backed by Shopify, with a slide-in cart drawer and handoff to Shopify checkout
- **Customer accounts** — register, login, password reset and an account dashboard (orders, addresses, details)
- **Multi-currency** — localised pricing via Shopify Markets with a currency selector and automatic geo-detection
- **Collection pages** — Bralette, Shapewear, Bodysuit and High Waist Brief, plus a full shop listing
- **Size guide** — tabbed size charts (Shapewear, Bodysuit, Bralette, Brief) with Excel and PDF export
- **Content pages** — About, Contact (with interactive globe), FAQ, and legal pages (Terms, Privacy & Cookies, Returns/Refund/Shipping)
- **Reviews** — Judge.me integration for product reviews
- **SEO** — dynamic sitemap generated from the live Shopify catalogue, structured data (JSON-LD), Open Graph images, robots and manifest
- **Polish** — smooth scrolling (Lenis), scroll-reveal animations (Framer Motion), route transition loader, skeleton loading states

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme` in `globals.css` — no `tailwind.config`) |
| Commerce | Shopify Storefront API |
| Reviews | Judge.me API |
| Animation | Framer Motion, Lenis |
| Maps / Globe | deck.gl, MapLibre GL, react-map-gl |
| Icons | lucide-react + hand-built brand/social icons (`components/BrandIcons.tsx`) |
| Fonts | Copperplate (self-hosted in `app/fonts`) + Google Fonts via `next/font` |

## Requirements

- Node.js 20+
- npm
- A Shopify store with:
  - A Storefront API access token (custom app with Storefront API scopes)
  - Shopify Markets configured for the countries/currencies you want to sell in
  - Shipping zones and rates set up for those countries
- Judge.me account with API tokens (for product reviews)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://augustanewham.com`) — used for SEO, sitemap and Open Graph |
   | `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Shopify store domain (e.g. `your-store.myshopify.com`) |
   | `SHOPIFY_STOREFRONT_API_VERSION` | Storefront API version (e.g. `2026-01`) |
   | `STOREFRONT_ACCESS_TOKEN` | Storefront API access token |
   | `JUDGEME_PUBLIC_API_TOKEN` | Judge.me public API token |
   | `JUDGEME_PRIVATE_API_TOKEN` | Judge.me private API token |

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
anewham/
├── app/                    # App Router pages
│   ├── page.tsx            # Home
│   ├── shop/               # All products
│   ├── bralette/           # Collection pages
│   ├── shapewear/
│   ├── bodysuit/
│   ├── high-waist-brief/
│   ├── product/            # Product detail pages
│   ├── collections/        # Shopify collection routes
│   ├── cart/               # Cart page
│   ├── account/            # Customer account dashboard
│   ├── login/ register/    # Auth pages
│   ├── size-guide/         # Size charts + export
│   ├── contact/ faq/ about/
│   ├── terms/ privacy-cookies/ returns-refund-shipping/
│   ├── api/                # Route handlers
│   ├── sitemap.ts          # Dynamic sitemap from Shopify catalogue
│   └── robots.ts, manifest.ts, opengraph-image.tsx
├── components/             # UI components (Header, Footer, CartDrawer, ProductDetail, …)
├── lib/                    # Shopify client, cart/account server actions, catalogue,
│                           # currency & country helpers, SEO and structured data
├── middleware.ts           # Request middleware (sessions / geo)
└── public/                 # Static assets
```

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/shop` | All products |
| `/bralette`, `/shapewear`, `/bodysuit`, `/high-waist-brief` | Collections |
| `/product/[handle]` | Product detail |
| `/cart` | Cart |
| `/size-guide` | Size guide |
| `/about`, `/contact`, `/faq` | Info pages |
| `/terms`, `/privacy-cookies`, `/returns-refund-shipping` | Legal |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account` | Customer accounts |

## Brand & Design

- Clean, editorial, minimal — black and white with warm neutral photography
- Wordmark and headings use Copperplate; body copy uses a clean sans-serif
- Mobile-first and fully responsive (375px → 1440px+)
- Accessibility baseline: semantic HTML, visible focus states, ARIA roles, keyboard navigation, descriptive alt text

## Deployment

The site is a standard Next.js app and deploys to Vercel (or any Node host). Set the environment variables above in your hosting provider before building. `NEXT_PUBLIC_SITE_URL` must match the production domain for correct canonical URLs, sitemap and Open Graph tags.

---

For questions contact: contactus@lumodesignagency.com
