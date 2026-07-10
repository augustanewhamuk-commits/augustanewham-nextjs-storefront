import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { AuthLayout } from "@/components/AuthLayout";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata: Metadata = buildMetadata({
  title: "Create Account",
  description: "Create an Augusta Newham account.",
  path: "/register",
  index: false,
});

export default function RegisterPage() {
  return (
    <AuthLayout eyebrow="Account" title="Create Account">
      <RegisterForm />
    </AuthLayout>
  );
}
