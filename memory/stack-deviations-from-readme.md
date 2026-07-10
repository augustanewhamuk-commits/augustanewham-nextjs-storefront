---
name: stack-deviations-from-readme
description: How the installed Augusta Newham project differs from the README handover doc
metadata:
  type: project
---

The installed scaffold differs from README.md (which assumes Next 14 + Tailwind v3 + `src/`). Match the install, not the doc:

- **Next.js 16.2.9 + React 19 + Turbopack** (doc said "14+").
- **Tailwind v4** — configured via `@theme` in `app/globals.css`. There is **no `tailwind.config.ts`**. Brand colour/font tokens live in the `@theme` block (e.g. `--color-brand-gold` → `bg-brand-gold`).
- **No `src/` folder** — `app/` is at the project root; `@/*` maps to `./*`. Put `components/` and `data/` at the root (not `src/`), overriding the doc's §11 folder tree.
- **Wordmark font:** user supplied the real **Copperplate Gothic Light** (`app/fonts/copperplate-gothic-light.ttf`), loaded via `next/font/local` as `--font-copperplate` → `--font-wordmark` token. Did NOT use the doc's Cinzel substitute. Body font is Inter (`next/font/google`).

- **lucide-react 1.18.0 has NO brand/social icons** — `Instagram`, `Facebook`, `Twitter`, `TikTok`, etc. do not exist (import would break the build). UI icons (`Menu`, `X`, `ChevronDown`, `ArrowRight`, `User`, `ShoppingBag`) are present. Social glyphs are hand-built inline SVGs in `components/BrandIcons.tsx`, used via `components/SocialLinks.tsx`. README §5.1 wrongly assumes lucide ships them.
- **Favicons** were installed from RealFaviconGenerator into `app/` (`icon0.svg`, `icon1.png`, `apple-icon.png`, `favicon.ico` — auto-detected by Next) + `public/web-app-manifest-{192,512}.png`. RFG's `manifest.json` was merged into the existing `app/manifest.ts` (can't have both). `apple-mobile-web-app-title` set via `appleWebApp.title` in layout metadata.

**Why:** `create-next-app` was already run before handover with newer defaults.
**How to apply:** When following README build steps, translate "edit tailwind.config.ts" → edit the `@theme` in globals.css, and drop the `src/` prefix on all paths.
