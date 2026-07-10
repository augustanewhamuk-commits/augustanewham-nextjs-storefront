# Augusta Newham — Next.js Storefront Design Prototype
## Requirements Document v1.0
> Prepared by Lumo Group for handover to Claude Code  
> Scope: **Design prototype only — no API, no Shopify integration, no backend, no live data**  
> All product data is hardcoded static mock data for visual approval purposes only

---

## 0. Ground Rules (Read First)

These rules apply to every decision made during the build. No exceptions.

- **No secrets, no env vars, no API keys** — this is a static prototype. Nothing connects to anything external.
- **No cutting corners** — every component must be complete, responsive, and pixel-intentional.
- **No huge changes without asking first** — if something in the requirements is ambiguous or two approaches exist, stop and present options before proceeding.
- **Ask before creating new pages or components not listed here** — scope is fixed to what is defined in this document.
- **Mobile-first** — build for mobile width first, then scale up to desktop. Every section must look correct at 375px and 1440px.
- **No `console.log` left in production code**, no unused imports, no TODO comments in shipped files.
- **All images use `next/image`** with correct `alt` text on every single image.
- **Accessibility baseline** — all interactive elements must have visible focus states, correct ARIA roles, and keyboard navigability.
- **Keep it simple** — if two approaches solve the same problem, always pick the simpler one.

---

## 1. Project Overview

**Client:** Augusta Newham  
**Website:** augustanewham.com  
**Project type:** Design prototype — Next.js static storefront (no live integration)  
**Phase:** Week 1 — Design Prototype only  
**Goal:** Build a pixel-faithful, fully responsive Next.js prototype of the Augusta Newham storefront that the client can view in the browser and approve before Shopify integration begins in Week 2.

Augusta Newham is a UK-based lingerie and shapewear brand. The aesthetic is clean, editorial, minimal — white and black with warm neutral photography. The design language should feel premium and body-positive.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Use `create-next-app` with TypeScript |
| Styling | Tailwind CSS | No CSS-in-JS, no styled-components |
| Images | `next/image` | All images use this component |
| Fonts | `next/font/google` | See typography section |
| Icons | `lucide-react` | For cart, user, social, menu icons |
| Data | Hardcoded `.ts` mock files | No API calls whatsoever |
| Deployment | Vercel (later) | Not in scope for prototype |

**Do not install:** axios, redux, react-query, prisma, any database library, any Shopify SDK, any auth library. This is a UI prototype only.

---

## 3. Brand & Design System

### 3.1 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `brand-white` | `#FFFFFF` | Page backgrounds, nav background |
| `brand-black` | `#000000` | Body text, borders, headings |
| `brand-off-white` | `#F9F9F9` | Alternate section backgrounds |
| `brand-gold` | `#E8A800` | Active nav item highlight (as seen in wireframes) |
| `brand-gray` | `#6B6B6B` | Secondary text, labels, footer copy |
| `brand-light-gray` | `#E5E5E5` | Borders, dividers, table lines |

### 3.2 Typography

The brand uses **Copperplate Gothic Light** for the wordmark. This is not available on Google Fonts. For the prototype, use the closest available match:

- **Wordmark / Brand name "AUGUSTA NEWHAM":** Use `'Cinzel'` from Google Fonts (wide, spaced, uppercase — closest feel to Copperplate Gothic Light). Apply `letter-spacing: 0.15em`, `font-weight: 300`, uppercase.
- **Navigation labels:** Same as wordmark but smaller — `Cinzel`, uppercase, `font-size: 13px`, `letter-spacing: 0.1em`
- **Body text / descriptions:** `'Inter'` or system sans-serif — clean, light weight, `font-size: 14-16px`
- **Footer copy / small labels:** `Inter`, `font-size: 12px`, `color: brand-gray`, wide letter-spacing where used for headings (e.g. "SIGN UP AND SAVE")
- **Size guide tables:** Monospace or `Inter` for legibility

Load both `Cinzel` and `Inter` via `next/font/google`.

### 3.3 Logo / Wordmark

The logo is a custom `&n` monogram (stylised) above the text "AUGUSTA NEWHAM".

For the prototype:
- Use an SVG placeholder that approximates the `&n` monogram — a stylised ampersand-n glyph. Keep it simple and clean.
- Place the SVG above the wordmark text on all pages.
- Logo is always **centred** at the top of every page.
- Wordmark text: `"AUGUSTA NEWHAM"` in Cinzel, uppercase, `font-size: 22px` on desktop, `18px` on mobile.

> **Do not use any third-party logo** — build the SVG approximation in code.

### 3.4 Spacing & Layout

- Max content width: `1400px`, centred with `auto` margins
- Page-level horizontal padding: `24px` mobile, `80px` desktop
- Section vertical spacing: `80px` between major sections on desktop, `48px` on mobile
- Nav border: thin `1px solid #E5E5E5` bottom border separating nav from content

---

## 4. Site Structure & Pages

This prototype builds the following pages. **Only these pages — nothing else.**

| Route | Page | Priority |
|---|---|---|
| `/` | Home / Landing | **Phase 1 — build first** |
| `/bralette` | Bralette collection | Phase 2 |
| `/shapewear` | Shapewear collection | Phase 2 |
| `/bodysuit` | Bodysuit collection | Phase 2 |
| `/high-waist-brief` | High Waist Brief collection | Phase 2 |
| `/size-guide` | Size Guide | Phase 2 |
| `/shop` | Shop Now (all products) | Phase 2 |
| `/contact` | Contact Us | Phase 2 |

> **Current scope = `/` (Home page) only.** All nav links must exist and be clickable, but non-home pages can show a clean "Coming Soon" placeholder layout (logo + nav + "Page coming soon" text + footer). Do not skip the nav or footer on placeholder pages.

---

## 5. Global Components

These components appear on every page and must be built before any page content.

### 5.1 Header / Navigation

**Layout (desktop):**
```
[top-right: Instagram icon | Facebook icon | TikTok icon | Currency selector "Nigeria (NGN ₦)"]
[centred: &n SVG monogram]
[centred: AUGUSTA NEWHAM wordmark]
[centred nav bar: Home | Bralette | Shapewear | Bodysuit | High Waist Brief | Size Guide | Shop Now | Contact Us]
[top-right icons: User account icon | Cart icon]
```
**Nav item styling:**
- Each nav item is wrapped in a thin rectangular border box (`1px solid #000`)
- Padding: `10px 18px` desktop, `8px 12px` mobile
- Font: Cinzel, uppercase, `13px`, `letter-spacing: 0.08em`
- Default state: white background, black border, black text
- Active/hover state: gold background (`#E8A800`), black border, black text (as seen in wireframes where active nav items are highlighted gold)
- Current page nav item should show gold highlight

**Top utility bar (desktop only, hide on mobile):**
- Right-aligned: social icons (Instagram, Facebook, TikTok using lucide-react) + currency label "Nigeria (NGN ₦)"
- Left: empty / logo centred across full width
- Very small text, `font-size: 12px`, `color: brand-gray`

**Mobile nav:**
- Hamburger menu icon (lucide-react `Menu`) replacing the full nav
- Full-screen overlay or slide-in drawer showing all nav items stacked vertically
- Keep user icon and cart icon visible on mobile header
- Logo centred on mobile header

**Cart icon:**
- Shows a badge with item count — for prototype, hardcode badge as `0` or omit badge
- No cart functionality required — clicking does nothing in prototype

**Account icon:**
- No functionality required in prototype — clicking does nothing

### 5.2 Footer

**Layout (two-column on desktop, stacked on mobile):**

Left column:
```
• About Us
• FAQ
• Terms and Conditions
• Returns, Refund and Shipping Policy
• Privacy and Cookies Policy
```
All as plain text links (no destination required in prototype — `href="#"`).

Right column:
```
SIGN UP AND SAVE
Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.

[Email input field _________________ ] [→ submit icon]

[Instagram icon] [Facebook icon] [TikTok icon]
```

**Footer styling:**
- White background, `1px solid #E5E5E5` top border
- "SIGN UP AND SAVE" heading: wide letter-spacing (`0.2em`), Cinzel or Inter uppercase, `font-size: 13px`
- Body text: `font-size: 13px`, `color: brand-gray`
- Email input: no border except bottom underline (`border-bottom: 1px solid #000`), no box, full width of column, `font-size: 14px`
- Submit arrow icon: `lucide-react` `ArrowRight` or envelope icon, right-aligned inside input
- Social icons: 24px, `color: brand-black`, inline row with `16px` gap
- Footer link list: no bullets or use `•` bullets, `font-size: 13px`, `color: brand-gray`, line-height `2`
- Footer padding: `60px 0` desktop, `40px 0` mobile

**Email input:** no form submission in prototype — input is visual only. No `action`, no POST. Show the field, that is all.

---

## 6. Home Page (`/`) — Full Specification

This is the **primary deliverable for Phase 1**.

### 6.1 Hero Section

The client's reference (page 1 and 10 of the PDF) shows a minimal layout with the hero area being largely empty/whitespace in their current Shopify store. For the prototype we elevate this:

**Hero layout:**
- Full-width section, `min-height: 80vh` on desktop, `60vh` on mobile
- Background: white
- Content: centred text block

**Hero content:**
```
[small eyebrow label — spaced caps]
PREMIUM LINGERIE & SHAPEWEAR

[large editorial headline]
Designed for
Every Body.

[subtext]
Bralettes, Bodysuits, Shapewear and High Waist Briefs —
crafted in shades that celebrate every skin tone.

[two CTA buttons side by side]
[  Shop Now  ]   [  View Collections  ]
```

**Hero styling:**
- Eyebrow: `Inter`, uppercase, `letter-spacing: 0.25em`, `font-size: 11px`, `color: brand-gray`
- Headline: `Cinzel`, `font-size: clamp(40px, 6vw, 80px)`, `font-weight: 300`, `line-height: 1.1`, black
- Subtext: `Inter`, `font-size: 16px`, `color: brand-gray`, `max-width: 480px`, centred
- Spacing between elements: `24px`
- Primary CTA ("Shop Now"): black background, white text, `padding: 14px 32px`, no border-radius (square corners), `font-size: 13px`, Cinzel uppercase
- Secondary CTA ("View Collections"): white background, black border `1px`, black text, same padding

> **Note for Claude Code:** If Augusta provides hero imagery before build, use `next/image` in the hero background. If not, use a clean white background with the text block only. Do not use any stock photography or placeholder images from external URLs.

### 6.2 Category Grid Section

This is the main visual section of the home page, directly referencing page 2 of the PDF.

**Section heading:**
```
OUR COLLECTIONS
```
Cinzel, uppercase, `font-size: 14px`, `letter-spacing: 0.2em`, centred, `margin-bottom: 40px`

**Grid layout:**
- 3-column grid on desktop, 2-column on tablet (768px), 1-column on mobile
- 7 category cards total displayed as a masonry-style or uniform grid
- Use CSS Grid: `grid-template-columns: repeat(3, 1fr)` on desktop

**Category cards — the 7 categories shown on page 2:**
1. Bodysuit (large card, bottom-left label overlay)
2. Shapewear (label overlay)
3. High Waist Brief (label overlay)
4. Bralette (label overlay)
5. [Additional editorial image — no label]
6. [Additional editorial image — no label]
7. [Additional editorial image — no label]

**Card styling:**
- Each card is a rectangular image container with `aspect-ratio: 3/4` (portrait)
- Image fills the card using `object-fit: cover`
- Category label overlay: bottom-left positioned, white background, black text, `padding: 8px 14px`, `font-size: 12px`, Cinzel uppercase — exactly matching the wireframe style
- On hover: subtle scale `transform: scale(1.02)`, `transition: 200ms ease`
- Card border: `1px solid #E5E5E5`
- Card is a clickable link to the relevant collection page

**Placeholder images for prototype:**
Since real product photos have not been received yet, use solid colour placeholder rectangles in brand-adjacent tones:
- `#D4C5B5` (warm beige)
- `#2C2C2C` (near black)
- `#8B6B5A` (chocolate brown)
- `#C4A882` (dark beige)
- `#F0EBE3` (cream)
- `#6B1A1A` (burgundy)

Use `div` with background-color and the label overlay, styled identically to how a real image card would look. **Do not use `picsum.photos` or any external image URL.**

### 6.3 Brand Statement / Editorial Strip (optional but recommended)

A single full-width editorial text strip between the grid and footer:

```
"Crafted for every curve. Available in shades built for every skin tone."
```

- Centred, `Cinzel`, `font-size: clamp(18px, 3vw, 32px)`, `font-weight: 300`
- `padding: 80px 24px`
- `background: #F9F9F9`
- Black text

---

## 7. Product Catalogue (Mock Data)

All data lives in `/src/data/products.ts`. No database, no API. This file is the single source of truth for all product listings in the prototype.

### 7.1 Categories & Products

```typescript
// /src/data/products.ts

export type ColourVariant = {
  name: string;
  hex: string; // approximate hex for the colour swatch
};

export type Product = {
  id: string;
  name: string;
  category: 'bralette' | 'shapewear' | 'bodysuit' | 'high-waist-brief';
  subcategory?: string;
  colours: ColourVariant[];
  sizes: string[];
  price: number; // in GBP for prototype
  description: string;
};

export const products: Product[] = [
  // --- BRALETTE ---
  // Subcategory: Unlined
  { id: 'b-unlined-black', name: 'Unlined Bralette', category: 'bralette', subcategory: 'Unlined', colours: [{ name: 'Black', hex: '#000000' }], sizes: ['XS','S','M','L','XL','XXL'], price: 28, description: 'A minimal unlined bralette in classic black.' },
  { id: 'b-unlined-chocolate', name: 'Unlined Bralette', category: 'bralette', subcategory: 'Unlined', colours: [{ name: 'Chocolate', hex: '#5C3317' }], sizes: ['XS','S','M','L','XL','XXL'], price: 28, description: 'A minimal unlined bralette in rich chocolate.' },
  { id: 'b-unlined-dark-beige', name: 'Unlined Bralette', category: 'bralette', subcategory: 'Unlined', colours: [{ name: 'Dark Beige', hex: '#C4A882' }], sizes: ['XS','S','M','L','XL','XXL'], price: 28, description: 'Unlined bralette in a deep warm beige.' },
  { id: 'b-unlined-beige', name: 'Unlined Bralette', category: 'bralette', subcategory: 'Unlined', colours: [{ name: 'Beige', hex: '#D4B896' }], sizes: ['XS','S','M','L','XL','XXL'], price: 28, description: 'Unlined bralette in a neutral beige.' },
  { id: 'b-unlined-cream', name: 'Unlined Bralette', category: 'bralette', subcategory: 'Unlined', colours: [{ name: 'Cream', hex: '#F5F0E8' }], sizes: ['XS','S','M','L','XL','XXL'], price: 28, description: 'Unlined bralette in soft cream.' },
  // Subcategory: Scrunched
  { id: 'b-scrunched-burgundy', name: 'Scrunched Bralette', category: 'bralette', subcategory: 'Scrunched', colours: [{ name: 'Burgundy', hex: '#6B1A1A' }], sizes: ['XS','S','M','L','XL','XXL'], price: 32, description: 'Textured scrunched bralette in deep burgundy.' },
  { id: 'b-scrunched-matcha', name: 'Scrunched Bralette', category: 'bralette', subcategory: 'Scrunched', colours: [{ name: 'Matcha', hex: '#8A9A5B' }], sizes: ['XS','S','M','L','XL','XXL'], price: 32, description: 'Textured scrunched bralette in matcha green.' },

  // --- SHAPEWEAR ---
  // Subcategory: Full Shapewear
  { id: 'sw-full-black', name: 'Full Shapewear', category: 'shapewear', subcategory: 'Full Shapewear', colours: [{ name: 'Black', hex: '#000000' }], sizes: ['XXS-XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 55, description: 'Full-coverage shapewear bodysuit in black.' },
  { id: 'sw-full-chocolate', name: 'Full Shapewear', category: 'shapewear', subcategory: 'Full Shapewear', colours: [{ name: 'Chocolate', hex: '#5C3317' }], sizes: ['XXS-XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 55, description: 'Full-coverage shapewear bodysuit in chocolate.' },
  // Subcategory: Removable Shapewear
  { id: 'sw-removable-black', name: 'Removable Shapewear', category: 'shapewear', subcategory: 'Removable Shapewear', colours: [{ name: 'Black', hex: '#000000' }], sizes: ['XXS-XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 60, description: 'Shapewear with removable straps in black.' },

  // --- BODYSUIT ---
  { id: 'bs-black', name: 'Bodysuit', category: 'bodysuit', colours: [{ name: 'Black', hex: '#000000' }], sizes: ['XXS/XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 45, description: 'Sleek bodysuit in classic black.' },
  { id: 'bs-chocolate', name: 'Bodysuit', category: 'bodysuit', colours: [{ name: 'Chocolate', hex: '#5C3317' }], sizes: ['XXS/XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 45, description: 'Sleek bodysuit in chocolate.' },
  { id: 'bs-beige', name: 'Bodysuit', category: 'bodysuit', colours: [{ name: 'Beige', hex: '#D4B896' }], sizes: ['XXS/XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 45, description: 'Sleek bodysuit in warm beige.' },
  { id: 'bs-dusty-brown', name: 'Bodysuit', category: 'bodysuit', colours: [{ name: 'Dusty Brown', hex: '#9E7B5E' }], sizes: ['XXS/XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 45, description: 'Sleek bodysuit in dusty brown.' },
  { id: 'bs-plum', name: 'Bodysuit', category: 'bodysuit', colours: [{ name: 'Plum', hex: '#4B0040' }], sizes: ['XXS/XS','S/M','M/L','L/XL','2XL/3XL','4XL/5XL','6XL/7XL'], price: 45, description: 'Sleek bodysuit in deep plum.' },

  // --- HIGH WAIST BRIEF ---
  { id: 'hwb-black', name: 'High Waist Brief', category: 'high-waist-brief', colours: [{ name: 'Black', hex: '#000000' }], sizes: ['XXS','XS','S','M','L','XL','XXL'], price: 22, description: 'High-waisted brief in classic black.' },
  { id: 'hwb-chocolate', name: 'High Waist Brief', category: 'high-waist-brief', colours: [{ name: 'Chocolate', hex: '#5C3317' }], sizes: ['XXS','XS','S','M','L','XL','XXL'], price: 22, description: 'High-waisted brief in chocolate.' },
  { id: 'hwb-dark-beige', name: 'High Waist Brief', category: 'high-waist-brief', colours: [{ name: 'Dark Beige', hex: '#C4A882' }], sizes: ['XXS','XS','S','M','L','XL','XXL'], price: 22, description: 'High-waisted brief in dark beige.' },
  { id: 'hwb-beige', name: 'High Waist Brief', category: 'high-waist-brief', colours: [{ name: 'Beige', hex: '#D4B896' }], sizes: ['XXS','XS','S','M','L','XL','XXL'], price: 22, description: 'High-waisted brief in warm beige.' },
  { id: 'hwb-cream', name: 'High Waist Brief', category: 'high-waist-brief', colours: [{ name: 'Cream', hex: '#F5F0E8' }], sizes: ['XXS','XS','S','M','L','XL','XXL'], price: 22, description: 'High-waisted brief in soft cream.' },
  { id: 'hwb-burgundy', name: 'High Waist Brief', category: 'high-waist-brief', colours: [{ name: 'Burgundy', hex: '#6B1A1A' }], sizes: ['XXS','XS','S','M','L','XL','XXL'], price: 22, description: 'High-waisted brief in deep burgundy.' },
  { id: 'hwb-matcha', name: 'High Waist Brief', category: 'high-waist-brief', colours: [{ name: 'Matcha', hex: '#8A9A5B' }], sizes: ['XXS','XS','S','M','L','XL','XXL'], price: 22, description: 'High-waisted brief in matcha green.' },
];
```

---

## 8. Size Guide Page Data

The size guide page (reference: page 7 of the PDF) contains 4 tables. All data is hardcoded — no CMS, no API.

### Shapewear Size Table
| SIZE | UK | Bust | Waist | Hip |
|---|---|---|---|---|
| XXS-XS | 4/6 | 31.5–33.5" | 24–26" | 34–36.5" |
| S/M | 8/10 | 34–36" | 26.5–28.5" | 37–39" |
| M/L | 12/14 | 36.5–38.5" | 29–31" | 39.5–41.5" |
| L/XL | 16 | 39–41" | 31.5–34.5" | 42–44" |
| 2XL/3XL | 18/20 | 41.5–44.5" | 35–38" | 44.5–47.5" |
| 4XL/5XL | 22 | 45–48" | 38.5–41.5" | 48–51" |
| 6XL/7XL | 24 | 48.5–52" | 42–45.5" | 51.5–55" |

### Bralette Size Table
| Band Size | UK | A | B | C | D | DD |
|---|---|---|---|---|---|---|
| 32 | XS | XS | S | S | S | — |
| 34 | S | S | S | M | M | — |
| 36 | M | M | M | L | L | — |
| 38 | L | L | L | XL | XL | — |
| 40 | XL | XL | XL | XXL | XXL | — |
| 42 | XXL | XXL | XXL | 3XL | 3XL | — |

### Shapewear Brief Size Table
| UK | UK Size | Waist | Hip |
|---|---|---|---|
| XXS | 6 | 23.2 | 34 |
| XS | 8 | 24.8 | 35 |
| S | 10 | 26.8 | 37 |
| M | 12 | 28.7 | 39 |
| L | 14 | 31.7 | 42 |
| XL | 16 | 38.2 | 49 |
| XXL | 18 | 38.2 | 49 |

### Bodysuit Shapewear Size Table
| SIZE | UK | Bust | Waist |
|---|---|---|---|
| XXS/XS | 4/6 | 31.5–33.5" | 24–26" |
| S/M | 8/10 | 34–36" | 26.5–28.5" |
| M/L | 12/14 | 36.5–38.5" | 29–31" |
| L/XL | 14/16 | 39–41" | 31.5–34.5" |
| 2XL/3XL | 18/20 | 41.5–44.5" | 35–38" |
| 4XL/5XL | 22 | 45–48" | 38.5–41.5" |
| 6XL/7XL | 24 | 48.5–52" | 42–45.5" |

---

## 9. Contact Page Data

Reference: page 9 of the PDF.

**Channel list (display as a clean two-column table or card layout):**

| Channel | Detail |
|---|---|
| Email | contactus@augustanewham.com |
| Instagram | @augustanewham |
| TikTok Shop | Under construction (TBC) |
| Amazon | Amazon.co.uk: Augusta Newham |
| WhatsApp | Link to WhatsApp (href only, no number exposed on prototype) |

**Customer service hours:**
```
Monday – Friday: 9am to 8pm
Saturday: 10am to 6pm
Sunday: Closed
```

**Contact page layout:**
- Logo + nav at top (global header)
- Page heading: "CONTACT US" in Cinzel, centred
- Channel table / cards below
- Service hours block below that
- Global footer at bottom

---

## 10. Navigation Routing Map

| Nav Label | Route | Notes |
|---|---|---|
| Home | `/` | Full home page |
| Bralette | `/bralette` | Collection page (Phase 2 — placeholder for now) |
| Shapewear | `/shapewear` | Collection page (Phase 2 — placeholder for now) |
| Bodysuit | `/bodysuit` | Collection page (Phase 2 — placeholder for now) |
| High Waist Brief | `/high-waist-brief` | Collection page (Phase 2 — placeholder for now) |
| Size Guide | `/size-guide` | Full size tables (Phase 2 — placeholder for now) |
| Shop Now | `/shop` | All products (Phase 2 — placeholder for now) |
| Contact Us | `/contact` | Contact info page (Phase 2 — placeholder for now) |

**"Shop Now" nav item** (per page 8 of the PDF) is a dropdown or direct link that reveals 4 sub-links: Bralette, Bodysuit, High Waist Brief, Shapewear. Implement as a hover dropdown on desktop, expanded section in mobile drawer.

---

## 11. Folder Structure

```
augusta-newham/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout (loads fonts, global CSS)
│   │   ├── page.tsx            ← Home page
│   │   ├── bralette/
│   │   │   └── page.tsx        ← Placeholder
│   │   ├── shapewear/
│   │   │   └── page.tsx        ← Placeholder
│   │   ├── bodysuit/
│   │   │   └── page.tsx        ← Placeholder
│   │   ├── high-waist-brief/
│   │   │   └── page.tsx        ← Placeholder
│   │   ├── size-guide/
│   │   │   └── page.tsx        ← Placeholder
│   │   ├── shop/
│   │   │   └── page.tsx        ← Placeholder
│   │   └── contact/
│   │       └── page.tsx        ← Placeholder
│   ├── components/
│   │   ├── Header.tsx          ← Global nav + logo
│   │   ├── Footer.tsx          ← Global footer
│   │   ├── CategoryCard.tsx    ← Reusable category image card
│   │   ├── CategoryGrid.tsx    ← Grid of CategoryCards
│   │   └── SizeTable.tsx       ← Reusable size guide table (Phase 2)
│   ├── data/
│   │   └── products.ts         ← All hardcoded product data
│   └── styles/
│       └── globals.css         ← Tailwind base + custom CSS vars
├── public/
│   └── (empty for now — real images added later)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 12. Behaviour & Interactions

### What works in the prototype:
- All navigation links route to their pages (or placeholder)
- Active nav item shows gold highlight
- Mobile hamburger opens/closes drawer
- "Shop Now" nav item shows dropdown with 4 category links
- Category cards on home page link to their collection routes
- CTA buttons on hero link to `/shop` and `/bralette` (or `#`)
- Footer email field is visually complete but does nothing on submit
- Social icons in footer link to:
  - Instagram: `https://www.instagram.com/augustanewham`
  - Facebook: `#` (not provided)
  - TikTok: `#` (TBC)

### What does NOT work in the prototype (by design):
- No cart functionality
- No product filtering
- No checkout
- No form submission
- No account login
- No currency switching (currency selector is visual only, shows "Nigeria (NGN ₦)" as static text)
- No Shopify connection

---

## 13. Responsive Breakpoints

| Breakpoint | Width | Behaviour |
|---|---|---|
| Mobile | `< 768px` | 1-column grid, hamburger nav, stacked footer |
| Tablet | `768px – 1024px` | 2-column grid, condensed nav |
| Desktop | `> 1024px` | 3-column grid, full horizontal nav, two-column footer |

---

## 14. Accessibility Requirements

- All `<img>` and `next/image` must have descriptive `alt` text
- All interactive elements (`<a>`, `<button>`) must have visible `:focus-visible` outline
- Colour contrast must meet WCAG AA — black on white always passes; check any text on gold background
- Mobile nav drawer must trap focus while open and return focus to trigger on close
- Semantic HTML throughout: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>` where appropriate

---

## 15. What to Build First (Phase 1 Order)

Work in this exact order. Do not skip ahead.

1. `create-next-app` with TypeScript and Tailwind
2. Install `lucide-react` and configure `next/font` for Cinzel + Inter
3. Set up `tailwind.config.ts` with brand colour tokens
4. Build `Header.tsx` — full desktop + mobile responsive
5. Build `Footer.tsx` — full desktop + mobile responsive
6. Create `/src/data/products.ts` with all mock data
7. Build `CategoryCard.tsx` component
8. Build `CategoryGrid.tsx` component
9. Build home page (`/`) with hero + category grid + editorial strip
10. Add placeholder `page.tsx` for all other routes (logo + nav + "Coming soon" + footer)
11. Verify responsiveness at 375px, 768px, and 1440px widths
12. Final check: no console errors, no broken links, all images have alt text

---

## 16. Questions to Ask Before Starting

If any of the following are unclear, **stop and ask** before proceeding:

- [ ] Real photography has not been provided yet — confirm placeholder colour blocks are acceptable for Phase 1 approval
- [ ] The `&n` monogram SVG — confirm approximation is acceptable or if a real SVG file will be provided
- [ ] Facebook URL — not provided, using `#` for now
- [ ] WhatsApp link — phone number not included in brief; using generic WhatsApp link or `#`
- [ ] Prices shown on home page category cards? (Not in the reference wireframes — omit unless asked)
- [ ] "About Us" page — not in the navigation but is in the footer; build as placeholder or skip entirely for Phase 1?

---

*Document version 1.0 — Lumo Group — 14 June 2026*  
*For questions contact: contactus@lumodesignagency.com*# anewham
# augustanewham-nextjs-storefront
# augustanewham-nextjs-storefront
