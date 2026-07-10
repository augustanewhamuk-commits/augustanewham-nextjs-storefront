"use client";

import Link from "next/link";
import { useActionState } from "react";
import { recoverAction, type FormState } from "@/lib/account-actions";
import {
  errorText,
  fieldInput,
  fieldLabel,
  primaryButton,
  successText,
} from "./form-styles";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    recoverAction,
    {},
  );

  if (state.success) {
    return (
      <div className="space-y-5">
        <p className={successText}>{state.success}</p>
        <Link
          href="/login"
          className="inline-block font-body text-[13px] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <p className="font-body text-[13px] leading-relaxed text-brand-gray">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <div>
        <label htmlFor="email" className={fieldLabel}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={fieldInput}
          required
        />
      </div>

      {state.error ? <p className={errorText}>{state.error}</p> : null}

      <button type="submit" disabled={isPending} className={primaryButton}>
        {isPending ? "Sending…" : "Send Reset Link"}
      </button>

      <p className="pt-2 text-center font-body text-[13px] text-brand-gray">
        <Link
          href="/login"
          className="text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
