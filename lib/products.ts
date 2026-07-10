/**
 * Product catalogue for the shop (static prototype — no backend).
 *
 * Built from the brand's product spec. Each product has colour variants; a
 * variant carries its own images (front/side/back), swatch hex and size range
 * (these differ per colour in the spec). Prices are in GBP.
 *
 * Not every colour has been photographed yet. A variant always lists all three
 * views — a view with no `src` renders as a labelled placeholder ([front],
 * [side], [back]) so the product still appears and is shoppable.
 *
 * TODO(client): prices for the Shapewear styles are provisional; confirm. Also
 * confirm composition/care/sizes for the Unlined Bralette (left blank in spec).
 */
export type ProductView = "front" | "side" | "back";

/**
 * A single gallery shot. `src` is omitted when no photo exists yet. `view` is a
 * label only (the static catalogue uses front/side/back; the Shopify adapter
 * passes the image alt text or an index), so it's widened to `string`.
 */
export type ProductImage = { view: string; src?: string };

export type ProductVariant = {
  /** Display colour, e.g. "Dark Beige". */
  color: string;
  /** Swatch hex. */
  hex: string;
  /** Gallery shots for this colour (front, side, back). */
  images: ProductImage[];
  /** Sizes available in this colour. */
  sizes: string[];
};

export type Product = {
  slug: string;
  name: string;
  /** Display label, e.g. "Bodysuit". */
  category: string;
  /** Primary category route (breadcrumbs, related, back-link), e.g. "/bodysuit". */
  categoryPath: string;
  /** Extra collection routes this product also appears in, e.g. ["/shapewear"]. */
  collections?: string[];
  /**
   * Price amount, already in `currencyCode` — Shopify localises it per market
   * via `@inContext(country:)`, so no client-side conversion is needed.
   */
  price: number;
  /** ISO 4217 currency of `price`, e.g. "GBP" / "USD" (from Shopify). */
  currencyCode: string;
  tagline: string;
  description: string;
  details: string[];
  composition: string;
  care: string;
  variants: ProductVariant[];
};

const IMG = "/media/images/products";

/** Shared neutral placeholder for thumbnails/cart when a variant has no photo. */
export const PLACEHOLDER_IMAGE = "/media/images/placeholder.svg";

/**
 * Build a variant's three views. Each angle flag may be:
 *   - `true`  → photo exists with the default `.jpg` extension
 *   - a string (e.g. `"jpeg"`, `"JPG"`) → photo exists with that extension
 *   - `false`/omitted → no photo, renders as a labelled placeholder
 * Order is front → side → back.
 */
type ViewFlag = boolean | string;

function views(
  base: string,
  has: { front?: ViewFlag; side?: ViewFlag; back?: ViewFlag } = {
    front: true,
    side: true,
    back: true,
  },
): ProductImage[] {
  const src = (view: ProductView, flag: ViewFlag | undefined) =>
    flag
      ? `${IMG}/${base}/${view}.${typeof flag === "string" ? flag : "jpg"}`
      : undefined;
  return [
    { view: "front", src: src("front", has.front) },
    { view: "side", src: src("side", has.side) },
    { view: "back", src: src("back", has.back) },
  ];
}

/** A colour with no photography yet — three labelled placeholders. */
function placeholderViews(): ProductImage[] {
  return [{ view: "front" }, { view: "side" }, { view: "back" }];
}

const SHAPEWEAR_SIZES = [
  "XXS/S", "M/L", "L/XL", "2XL/3XL", "4XL/5XL", "6XL/7XL",
];
const BRALETTE_SIZES = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL",
];
const UNLINED_BRALETTE_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const BODYSUIT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const BODYSUIT_SIZES_EXT = [...BODYSUIT_SIZES, "4XL", "5XL"];
const BRIEF_SIZES = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL",
];

// Static prototype catalogue (launch-time fallback, currently disabled). Authored
// in GBP; `currencyCode` is stamped on below so the literals stay uncluttered.
const staticProductData: Omit<Product, "currencyCode">[] = [
  {
    slug: "full-shapewear",
    name: "Full Shapewear",
    category: "Shapewear",
    categoryPath: "/shapewear",
    price: 25, // TODO(client): confirm price
    tagline: "Fully firm seamless shapewear with waist and thigh control",
    description:
      "A perfect first step to dressing up for the day with our seamless full body shapewear which adds a cinch to the waist, keeping you in the right temperature all day long.",
    details: [
      "Fully firm seamless construction",
      "Waist and thigh control",
      "Temperature-regulating fabric",
    ],
    composition: "78% Nylon, 22% Spandex — anti-bacterial, breathable",
    care: "Machine wash cold",
    variants: [
      { color: "Black", hex: "#1a1a1a", images: views("shapewear/full-body-shapewear/black", { front: true, side: "jpeg", back: "jpeg" }), sizes: SHAPEWEAR_SIZES },
      { color: "Chocolate", hex: "#663300", images: views("shapewear/full-body-shapewear/chocolate", { front: true, back: true }), sizes: SHAPEWEAR_SIZES },
    ],
  },
  {
    slug: "removable-strap-shapewear",
    name: "Removable Strap Shapewear",
    category: "Shapewear",
    categoryPath: "/shapewear",
    price: 25, // TODO(client): confirm price
    tagline: "Firm control seamless shapewear with adjustable straps",
    description:
      "A perfect first step to dressing up for the day with our seamless full body shapewear which adds a cinch to the waist, keeping you in the right temperature all day long.",
    details: [
      "Firm control seamless construction",
      "Adjustable, removable straps",
      "Temperature-regulating fabric",
    ],
    composition: "78% Nylon, 22% Spandex — anti-bacterial, breathable",
    care: "Machine wash cold",
    variants: [
      { color: "Black", hex: "#1a1a1a", images: views("shapewear/removable-strap-shapewear/black", { front: "jpeg" }), sizes: SHAPEWEAR_SIZES },
    ],
  },
  {
    slug: "scrunched-bralette",
    name: "Scrunched Bralette",
    category: "Bralette",
    categoryPath: "/bralette",
    price: 9.99,
    tagline: "Smooth seamless bralette",
    description:
      "A smooth, seamless scrunched bralette in soft stretch fabric — wireless and lineless, in shades made for every skin tone.",
    details: [
      "Smooth seamless finish",
      "Wireless, lineless support",
      "Breathable for all-day wear",
    ],
    composition: "74% Nylon, 26% Spandex — anti-bacterial, breathable",
    care: "Hand wash only",
    variants: [
      { color: "Burgundy", hex: "#800020", images: views("bralette/burgundy"), sizes: BRALETTE_SIZES },
      { color: "Matcha", hex: "#b9dca9", images: views("bralette/matcha", { front: true, side: true }), sizes: BRALETTE_SIZES },
    ],
  },
  {
    slug: "unlined-bralette",
    name: "Unlined Bralette",
    category: "Bralette",
    categoryPath: "/bralette",
    price: 9.99,
    tagline: "Lineless bralette for extra comfort",
    description:
      "An unlined, lineless bralette in adequately layered, smooth and cosy fabric — cup-shaped front with a U-back and an adjustable strap, finished with a band that sits well on the skin.",
    details: [
      "Lineless bralette for extra comfort",
      "Adequately layered, smooth and cosy fabric",
      "Cup shape in front and U-back",
      "Adjustable strap",
      "Lower band sits well on the skin",
    ],
    // TODO(client): confirm composition / care / sizes (left blank in spec).
    composition: "74% Nylon, 26% Spandex — anti-bacterial, breathable",
    care: "Hand wash only",
    variants: [
      { color: "Black", hex: "#1a1a1a", images: views("bralette/black", { front: true, back: true }), sizes: UNLINED_BRALETTE_SIZES },
      { color: "Dark Beige", hex: "#a67b5b", images: views("bralette/dark-beige", { front: true, side: true }), sizes: UNLINED_BRALETTE_SIZES },
      { color: "Light Beige", hex: "#edc9af", images: views("bralette/light-beige"), sizes: UNLINED_BRALETTE_SIZES },
      { color: "Chocolate", hex: "#663300", images: placeholderViews(), sizes: UNLINED_BRALETTE_SIZES },
      { color: "Cream", hex: "#fdfbd4", images: views("bralette/cream"), sizes: UNLINED_BRALETTE_SIZES },
    ],
  },
  {
    slug: "smooth-seamless-firm-bodysuit",
    name: "Smooth Seamless Firm Bodysuit",
    category: "Bodysuit",
    categoryPath: "/bodysuit",
    price: 15,
    tagline: "The 'Sultry' carving bodysuit",
    description:
      "Augusta Newham's 'Sultry' carving bodysuit, developed for the perfect sculpt. This figure-carving style adds extra firmness at the core and waist, moulding the body for a flawless line under anything.",
    details: [
      "Figure-carving firm control",
      "Adjustable straps",
      "Cotton gusset with snap closure",
      "Lineless bust for extra comfort",
    ],
    composition: "77% Nylon, 23% Spandex — anti-bacterial, breathable",
    care: "Machine wash cold",
    variants: [
      { color: "Black", hex: "#1a1a1a", images: views("bodysuit/black"), sizes: BODYSUIT_SIZES },
      { color: "Beige", hex: "#edc9af", images: views("bodysuit/beige", { front: true, back: true }), sizes: BODYSUIT_SIZES },
      { color: "Chocolate", hex: "#663300", images: views("bodysuit/dark-brown"), sizes: BODYSUIT_SIZES_EXT },
      { color: "Dusty Brown", hex: "#666633", images: views("bodysuit/dusty-brown", { front: true, back: true }), sizes: BODYSUIT_SIZES },
      { color: "Plum", hex: "#660033", images: views("bodysuit/plum"), sizes: BODYSUIT_SIZES },
    ],
  },
  {
    slug: "high-waisted-firm-shapewear-pant",
    name: "High Waisted Firm Shapewear Pant",
    category: "High Waist Brief",
    categoryPath: "/high-waist-brief",
    price: 9.99,
    tagline: "High-waisted firm control",
    description:
      "A high-waisted firm shapewear pant with stretch fabric that shapes the rear and gives firm but comfortable tummy control — smooth, seamless and breathable for all-day wear.",
    details: [
      "Stretchy fabric shapes the derriere",
      "Firm but comfortable tummy control",
      "Breathable fabric",
    ],
    composition: "93% Nylon, 6% Spandex, 1% anti-bacterial yarn — breathable",
    care: "Hand wash only",
    variants: [
      { color: "Burgundy", hex: "#800020", images: views("highwaist-brief/burgundy"), sizes: BRIEF_SIZES },
      { color: "Matcha", hex: "#b9dca9", images: views("highwaist-brief/matcha", { front: true, side: true, back: "jpeg" }), sizes: BRIEF_SIZES },
      { color: "Black", hex: "#1a1a1a", images: views("highwaist-brief/black"), sizes: BRIEF_SIZES },
      { color: "Dark Beige", hex: "#a67b5b", images: views("highwaist-brief/dark-beige", { front: true, side: true }), sizes: BRIEF_SIZES },
      { color: "Chocolate", hex: "#663300", images: placeholderViews(), sizes: BRIEF_SIZES },
      { color: "Beige", hex: "#edc9af", images: views("highwaist-brief/beige", { front: "JPG", side: "JPG", back: "JPG" }), sizes: BRIEF_SIZES },
      { color: "Cream", hex: "#fdfbd4", images: views("highwaist-brief/cream"), sizes: BRIEF_SIZES },
    ],
  },
];

export const products: Product[] = staticProductData.map((p) => ({
  ...p,
  currencyCode: "GBP",
}));

/** First real photo for a variant, or the shared placeholder image. */
export function variantImage(variant: ProductVariant): string {
  return variant.images.find((img) => img.src)?.src ?? PLACEHOLDER_IMAGE;
}

/** Primary image for cards / featured rows. */
export function cardImage(product: Product): string {
  return variantImage(product.variants[0]);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function productsByCategoryPath(path: string): Product[] {
  return products.filter(
    (product) =>
      product.categoryPath === path || product.collections?.includes(path),
  );
}

/** Every unique colour we carry across the whole catalogue (de-duped by name). */
export function allColors(): { color: string; hex: string }[] {
  const seen = new Map<string, { color: string; hex: string }>();
  for (const product of products) {
    for (const variant of product.variants) {
      if (!seen.has(variant.color)) {
        seen.set(variant.color, { color: variant.color, hex: variant.hex });
      }
    }
  }
  return [...seen.values()];
}

export type CategorySwatch = { color: string; hex: string; image: string };

/**
 * The unique colours available across a category (de-duplicated by colour name),
 * each with its best front image — powers the homepage "Find your base" swatch
 * picker. Colours without a photo fall back to the shared placeholder.
 */
export function categorySwatches(categoryPath: string): CategorySwatch[] {
  const seen = new Map<string, CategorySwatch>();
  for (const product of productsByCategoryPath(categoryPath)) {
    for (const variant of product.variants) {
      if (!seen.has(variant.color)) {
        seen.set(variant.color, {
          color: variant.color,
          hex: variant.hex,
          image: variantImage(variant),
        });
      }
    }
  }
  return [...seen.values()];
}

/** Shown in the homepage "Base Edit" — only products with real photography. */
export const featuredProducts: Product[] = products.filter((product) =>
  product.variants.some((variant) => variant.images.some((img) => img.src)),
);
