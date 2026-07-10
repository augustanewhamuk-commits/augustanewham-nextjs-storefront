---
name: seo-and-routes-architecture
description: How routes, placeholders and the SEO layer are structured in the Augusta Newham prototype
metadata:
  type: project
---

Page structure + SEO were built before real page content (placeholders only). Architecture:

- **`lib/routes.ts`** — single source of truth for every route (path, label, inNav, inFooter, sitemap priority/changeFrequency). Consumed by `app/sitemap.ts`, `siteNavigationSchema()`, and (later) the Header/Footer nav. Add new routes here.
- **`lib/site.ts`** — central site config (name, url `https://augustanewham.com`, locale `en_GB`, social, email). `sameAs` = confirmed social profiles (Instagram only; FB/TikTok are `#`).
- **`lib/seo.ts`** — `buildMetadata({title, description, path, index?})` per-page helper (canonical + OG + Twitter). Each `page.tsx` exports `metadata = buildMetadata(...)`.
- **`lib/structured-data.ts`** — JSON-LD builders. Global (in `app/layout.tsx`): `organizationSchema`, `websiteSchema` (has SearchAction → eligible for Google Sitelinks search box), `siteNavigationSchema`. Per page: `breadcrumbSchema` + `pageSchema({type})` where type is WebPage/CollectionPage/ContactPage/AboutPage/FAQPage.
- **`components/JsonLd.tsx`** renders the schema; **`components/PagePlaceholder.tsx`** is the temporary "coming soon" shell.
- SEO routes: `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, dynamic `app/opengraph-image.tsx` (next/og). `public/logo.svg` is the placeholder `&n` monogram, also used as Organization logo.

**Pages beyond README §4:** added the footer/legal pages (`/about`, `/faq`, `/terms`, `/returns-refund-shipping`, `/privacy-cookies`) at the user's request ("privacy policy and more"). README §16 had left About Us as an open question — now built as placeholder.

**Still placeholder (no real content):** all collection pages, size-guide tables, contact details, hero/category grid. Header/Footer not built yet — placeholders render without them for now. See [[stack-deviations-from-readme]].
