"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { subscribeAction } from "@/lib/subscribe-actions";
import { refreshCart } from "@/lib/cart";
import { SUBSCRIBE_PROMPTED_KEY } from "./SubscribeModal";

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError(null);
    const result = await subscribeAction(email);
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
    <form onSubmit={submit}>
      <div className="mt-5 flex items-center border-b border-brand-black">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          required
          disabled={status === "loading"}
          className="w-full bg-transparent py-2 text-[14px] text-brand-black outline-none placeholder:text-brand-gray disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          disabled={status === "loading"}
          className="inline-flex p-2 text-brand-black transition-colors hover:text-brand-gray disabled:opacity-60"
        >
          <ArrowRight
            className={`h-5 w-5 ${status === "loading" ? "animate-pulse" : ""}`}
            aria-hidden="true"
          />
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
