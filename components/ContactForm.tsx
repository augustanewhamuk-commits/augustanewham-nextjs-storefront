"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { sendContactAction, type ContactResult } from "@/lib/contact-actions";
import { site } from "@/lib/site";

/**
 * Give up waiting on the server after this long — the send retries server-side
 * for up to ~20s worst case; past that the visitor deserves an answer.
 */
const CLIENT_TIMEOUT_MS = 25_000;

const TIMED_OUT: ContactResult = {
  ok: false,
  code: "send_failed",
  error: `This is taking longer than it should. Please try again, or email us directly at ${site.email}.`,
};

const fieldLabel =
  "block font-body text-[11px] uppercase tracking-[0.18em] text-brand-gray";
const fieldInput =
  "mt-2 w-full appearance-none rounded-none border-0 bg-brand-off-white px-4 py-3 font-body text-[15px] text-brand-black shadow-none transition-colors placeholder:text-brand-gray/70 outline-none focus:bg-brand-light-gray/40 focus:outline-none focus:ring-0 focus-visible:outline-none";

const INTERESTS = [
  "General enquiry",
  "Order support",
  "Returns & refunds",
  "Wholesale / Collaboration",
  "Other",
];

/**
 * Contact form — submits to a server action that emails the message to the
 * brand mailbox over SMTP (lib/contact-actions.ts). No mail client involved.
 */
export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setError(null);
    setSent(false);
    let result: ContactResult;
    try {
      result = await Promise.race([
        sendContactAction({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          interest: String(data.get("interest") ?? ""),
          message: String(data.get("message") ?? ""),
          company: String(data.get("company") ?? ""),
        }),
        new Promise<ContactResult>((resolve) =>
          window.setTimeout(() => resolve(TIMED_OUT), CLIENT_TIMEOUT_MS),
        ),
      ]);
    } catch {
      // Network drop / server unreachable — the action never answered.
      result = TIMED_OUT;
    }
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    form.reset();
    setSent(true);
  };

  return (
    <form
      onSubmit={onSubmit}
      // Editing after a failure clears the message straight away.
      onInput={() => {
        if (error) setError(null);
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={fieldLabel}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldInput}
          />
        </div>
        <div>
          <label htmlFor="email" className={fieldLabel}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldInput}
          />
        </div>
        <div>
          <label htmlFor="interest" className={fieldLabel}>
            Interested In
          </label>
          <div className="relative">
            <select
              id="interest"
              name="interest"
              defaultValue=""
              className={`${fieldInput} pr-10`}
            >
              <option value="" disabled>
                Select an option
              </option>
              {INTERESTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className={fieldLabel}>
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldInput}
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="message" className={fieldLabel}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`${fieldInput} resize-y`}
        />
      </div>

      {/* Honeypot — visually hidden; bots that fill it are silently dropped. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 bg-brand-black px-7 py-3 font-body text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray disabled:cursor-wait disabled:bg-brand-gray/60"
        >
          {sending ? (
            "Sending…"
          ) : sent ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Sent
            </>
          ) : (
            <>
              Submit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
        <p
          className={`font-body text-[12px] ${error ? "text-red-700" : "text-brand-gray"}`}
          aria-live="polite"
        >
          {error
            ? error
            : sent
              ? "Thank you — your message has been sent. We'll get back to you soon."
              : ""}
        </p>
      </div>
    </form>
  );
}
