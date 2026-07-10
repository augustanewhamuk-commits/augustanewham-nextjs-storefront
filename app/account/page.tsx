import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/structured-data";
import { AccountDashboard } from "@/components/AccountDashboard";
import { getAccount } from "@/lib/customer";
import { getCustomerToken } from "@/lib/session";
import { logoutAction } from "@/lib/account-actions";

export const metadata: Metadata = buildMetadata({
  title: "My Account",
  description: "Manage your Augusta Newham profile, addresses and orders.",
  path: "/account",
  index: false, // private account area — no SEO value
});

// Customer data is per-request and authenticated; never statically cached.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  // Middleware gates on cookie presence; the token can still be expired/invalid
  // here, in which case getAccount returns null — fall back to login.
  const token = await getCustomerToken();
  if (!token) redirect("/login?redirect=/account");

  const account = await getAccount(token, 10);
  if (!account) redirect("/login?redirect=/account");

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "My Account", path: "/account" },
        ])}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16 lg:px-10 lg:py-20">
        <header className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
              Account
            </p>
            <h1 className="mt-2 font-wordmark text-3xl font-light uppercase tracking-[0.12em] text-brand-black sm:text-4xl">
              My Account
            </h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="shrink-0 font-body text-[12px] uppercase tracking-[0.08em] text-brand-gray underline decoration-1 underline-offset-4 transition-colors hover:text-brand-black"
            >
              Sign out
            </button>
          </form>
        </header>

        <AccountDashboard
          customer={account.customer}
          orders={account.orders}
        />
      </main>
    </>
  );
}
