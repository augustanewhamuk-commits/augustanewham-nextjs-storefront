import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { AuthLayout } from "@/components/AuthLayout";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your Augusta Newham account password.",
  path: "/forgot-password",
  index: false,
});

export default function ForgotPasswordPage() {
  return (
    <AuthLayout eyebrow="Account" title="Reset Password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
