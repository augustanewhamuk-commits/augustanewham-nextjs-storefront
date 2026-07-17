"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { refreshCart } from "@/lib/cart";
import {
  SUBSCRIBE_PROMPTED_KEY,
  subscribeWithTimeout,
  validateEmail,
} from "./SubscribeModal";

/**
 * Footer newsletter signup — creates the subscriber in Shopify (see
 * lib/subscribe-actions.ts) and refreshes the route + cart so subscriber
 * prices and the automatic discount appear straight away.
 */
export function NewsletterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Until hydration attaches our submit handler, a click/Enter would perform a
  // native form submission — a full page reload that sends nothing. Keeping
  // the (sole) submit button disabled in the server-rendered HTML blocks both
  // clicks and implicit Enter submission during that window.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "loading") return;
    const invalid = validateEmail(email);
    if (invalid) {
      setError(invalid);
      return;
    }
    setStatus("loading");
    setError(null);
    const result = await subscribeWithTimeout(email);
    if (result.error) {
      setStatus("idle");
      setError(result.error);
      return;
    }
    setStatus("success");
    setMessage(result.success ?? "You're on the list.");
    // They've engaged with the signup — don't show the session prompt on top.
    try {
      sessionStorage.setItem(SUBSCRIBE_PROMPTED_KEY, "1");
    } catch {
      // sessionStorage unavailable (private mode edge cases) — non-fatal.
    }
    router.refresh();
    void refreshCart();
  };

  if (status === "success") {
    return (
      <p className="mt-5 font-body text-[13px] leading-relaxed text-brand-black">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="mt-5 flex items-center border-b border-brand-black">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Email address"
          autoComplete="email"
          required
          disabled={status === "loading"}
          className="w-full bg-transparent py-2 text-[14px] text-brand-black outline-none placeholder:text-brand-gray disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          disabled={!ready || status === "loading"}
          className="inline-flex p-2 text-brand-black transition-colors hover:text-brand-gray disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-2 font-body text-[12px] leading-relaxed text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
