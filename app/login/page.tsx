import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to your Augusta Newham account.",
  path: "/login",
  index: false,
});

export default function LoginPage() {
  return (
    <AuthLayout eyebrow="Account" title="Sign In">
      <LoginForm />
    </AuthLayout>
  );
}
