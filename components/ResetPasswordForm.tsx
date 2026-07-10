"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetAction, type FormState } from "@/lib/account-actions";
import {
  errorText,
  fieldInput,
  fieldLabel,
  primaryButton,
} from "./form-styles";

/**
 * `resetUrl` is the Shopify-hosted reset URL carried into our page (the password
 * reset email must be configured to route customers here with it). Without it we
 * can't complete the reset.
 */
export function ResetPasswordForm({ resetUrl }: { resetUrl: string | null }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    resetAction,
    {},
  );

  if (!resetUrl) {
    return (
      <div className="space-y-5">
        <p className={errorText}>
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block font-body text-[13px] text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="resetUrl" value={resetUrl} />
      <div>
        <label htmlFor="password" className={fieldLabel}>
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={fieldInput}
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className={fieldLabel}>
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={fieldInput}
          required
        />
      </div>

      {state.error ? <p className={errorText}>{state.error}</p> : null}

      <button type="submit" disabled={isPending} className={primaryButton}>
        {isPending ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}
