"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type FormState } from "@/lib/account-actions";
import {
  errorText,
  fieldInput,
  fieldLabel,
  primaryButton,
} from "./form-styles";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
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
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className={fieldLabel}>
            Password
          </label>
          <Link
            href="/forgot-password"
            className="font-body text-[11px] uppercase tracking-[0.08em] text-brand-gray underline decoration-1 underline-offset-4 transition-colors hover:text-brand-black"
          >
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={fieldInput}
          required
        />
      </div>

      {state.error ? <p className={errorText}>{state.error}</p> : null}

      <button type="submit" disabled={isPending} className={primaryButton}>
        {isPending ? "Signing in…" : "Sign In"}
      </button>

      <p className="pt-2 text-center font-body text-[13px] text-brand-gray">
        New here?{" "}
        <Link
          href="/register"
          className="text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
