"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type FormState } from "@/lib/account-actions";
import {
  errorText,
  fieldInput,
  fieldLabel,
  primaryButton,
} from "./form-styles";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    registerAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={fieldLabel}>
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            className={fieldInput}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className={fieldLabel}>
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            className={fieldInput}
            required
          />
        </div>
      </div>
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
        <label htmlFor="password" className={fieldLabel}>
          Password
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
        {isPending ? "Creating account…" : "Create Account"}
      </button>

      <p className="pt-2 text-center font-body text-[13px] text-brand-gray">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-black underline decoration-1 underline-offset-4 transition-colors hover:text-brand-gray"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
