"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
} as const;

type SortKey = keyof typeof SORTS;

export function ShopListing({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [color, setColor] = useState("All");

  // Filters are derived from the catalogue so they track whatever is in Shopify.
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products],
  );
  const colors = useMemo(() => {
    const seen = new Map<string, { color: string; hex: string }>();
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.color && !seen.has(variant.color)) {
          seen.set(variant.color, { color: variant.color, hex: variant.hex });
        }
      }
    }
    return [...seen.values()];
  }, [products]);

  const visible = useMemo(() => {
    const filtered =
      category === "All"
        ? products
        : products.filter((product) => product.category === category);
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [category, sort, products]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-brand-light-gray pb-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Category filter — hidden while the catalogue has a single category
            ("All" + one product type), where it can't filter anything. */}
        {categories.length > 2 && (
        <div
          role="tablist"
          aria-label="Filter by category"
          className="-mx-1 flex gap-1 overflow-x-auto"
        >
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap px-3 py-1.5 font-wordmark text-[12px] uppercase tracking-[0.08em] transition-colors ${
                  active
                    ? "bg-brand-black text-brand-white"
                    : "text-brand-gray hover:text-brand-black"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        )}

        <div className="flex shrink-0 gap-2 self-start sm:ml-auto sm:self-auto">
          {/* Colour */}
          <div className="relative">
            <label htmlFor="color" className="sr-only">
              Choose a colour
            </label>
            <select
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="appearance-none rounded-none border border-brand-light-gray bg-brand-white py-2 pl-4 pr-10 font-body text-[12px] uppercase tracking-[0.06em] text-brand-black outline-none transition-colors focus:border-brand-black"
            >
              <option value="All">All colours</option>
              {colors.map((c) => (
                <option key={c.color} value={c.color}>
                  {c.color}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-none border border-brand-light-gray bg-brand-white py-2 pl-4 pr-10 font-body text-[12px] uppercase tracking-[0.06em] text-brand-black outline-none transition-colors focus:border-brand-black"
            >
              {Object.entries(SORTS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <p className="mt-5 font-body text-[12px] text-brand-gray">
        {visible.length} {visible.length === 1 ? "item" : "items"}
      </p>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-wordmark text-lg uppercase tracking-[0.1em] text-brand-black">
            No products available
          </p>
          <p className="mt-3 max-w-sm font-body text-[14px] text-brand-gray">
            Our collection is being updated. Please check back soon.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              preferredColor={color === "All" ? undefined : color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
