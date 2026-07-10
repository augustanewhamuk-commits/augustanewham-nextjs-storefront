import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/structured-data";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = buildMetadata({
  title: "Your Cart",
  description: "Review the items in your Augusta Newham cart.",
  path: "/cart",
  index: false, // private utility page — no SEO value
});

export default function CartPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Cart", path: "/cart" },
        ])}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
        <header className="mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
            Shopping
          </p>
          <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-4xl">
            Your Cart
          </h1>
        </header>

        <CartView />
      </main>
    </>
  );
}
