"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { subscribeAction } from "@/lib/subscribe-actions";
import { SUBSCRIBER_DISCOUNT_PERCENT } from "@/lib/discount";
import { refreshCart } from "@/lib/cart";
import { errorText, fieldInput, primaryButton } from "./form-styles";

/** Once set for the browser session, the prompt stays away. */
export const SUBSCRIBE_PROMPTED_KEY = "an-subscribe-prompted";

/** Don't interrupt someone who is mid-auth or checking out. */
const QUIET_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/cart",
];

const OPEN_DELAY_MS = 4000;

/**
 * Newsletter signup prompt, shown once per browser session (sessionStorage) to
 * visitors the server believes are neither logged in nor subscribed (`enabled`
 * comes from the layout's cookie check). Subscribing stamps the subscriber
 * cookies server-side; we then refresh the route (subscriber prices appear)
 * and the cart (Shopify attaches the email and applies the discount).
 */
export function SubscribeModal({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enabled) return;
    if (QUIET_ROUTES.some((route) => pathname.startsWith(route))) return;
    if (sessionStorage.getItem(SUBSCRIBE_PROMPTED_KEY)) return;
    const timer = window.setTimeout(() => {
      // A footer signup (or login) in the meantime also sets the flag — check
      // again at fire time so we never prompt someone who just subscribed.
      if (sessionStorage.getItem(SUBSCRIBE_PROMPTED_KEY)) return;
      sessionStorage.setItem(SUBSCRIBE_PROMPTED_KEY, "1");
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, pathname]);

  // Scroll lock + Escape to close + focus the email field.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError(null);
    // A network drop rejects the action itself — treat it like a form error
    // so the modal never hangs in the loading state.
    const result = await subscribeAction(email).catch(() => ({
      error: "We couldn't reach the store — please try again in a moment.",
      success: undefined,
    }));
    if (result.error) {
      setStatus("idle");
      setError(result.error);
      return;
    }
    setStatus("success");
    setMessage(result.success ?? "You're on the list.");
    // Cookies are set — re-render server components (subscriber prices) and
    // re-fetch the cart so Shopify's discount shows up immediately.
    router.refresh();
    void refreshCart();
    window.setTimeout(() => setOpen(false), 2600);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-brand-black/40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Subscribe and save"
        className="relative w-full max-w-md bg-brand-white p-8 shadow-xl sm:p-10"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex p-2 text-brand-gray transition-colors hover:text-brand-black"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2 className="font-wordmark text-[16px] uppercase tracking-[0.18em] text-brand-black">
          Sign up &amp; save {SUBSCRIBER_DISCOUNT_PERCENT}%
        </h2>
        <p className="mt-3 font-body text-[13px] leading-relaxed text-brand-gray">
          Subscribe to our newsletter and enjoy{" "}
          {SUBSCRIBER_DISCOUNT_PERCENT}% off every order — applied automatically
          in your cart.
        </p>

        {status === "success" ? (
          <p className="mt-6 font-body text-[14px] leading-relaxed text-brand-black">
            {message}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6">
            <label htmlFor="subscribe-modal-email" className="sr-only">
              Email address
            </label>
            <input
              ref={inputRef}
              id="subscribe-modal-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              autoComplete="email"
              required
              className={fieldInput}
            />
            {error ? <p className={`mt-2 ${errorText}`}>{error}</p> : null}
            <button
              type="submit"
              disabled={status === "loading"}
              className={`mt-4 ${primaryButton}`}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 block w-full text-center font-body text-[12px] uppercase tracking-[0.12em] text-brand-gray transition-colors hover:text-brand-black"
            >
              No thanks
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
