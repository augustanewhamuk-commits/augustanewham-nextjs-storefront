import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { AuthLayout } from "@/components/AuthLayout";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = buildMetadata({
  title: "Set New Password",
  description: "Choose a new password for your Augusta Newham account.",
  path: "/reset-password",
  index: false,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ reset_url?: string }>;
}) {
  // The reset email must route customers here carrying their Shopify reset URL.
  const { reset_url } = await searchParams;
  return (
    <AuthLayout eyebrow="Account" title="Set New Password">
      <ResetPasswordForm resetUrl={reset_url ?? null} />
    </AuthLayout>
  );
}
