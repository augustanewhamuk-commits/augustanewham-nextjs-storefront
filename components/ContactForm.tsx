"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { site } from "@/lib/site";

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
 * Static-site contact form: composes a pre-filled email and opens the
 * visitor's mail client (no backend required).
 */
export function ContactForm() {
  const [opened, setOpened] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const interest = String(data.get("interest") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      interest ? `Interested in: ${interest}` : null,
      "",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const subject = interest
      ? `Website enquiry — ${interest}`
      : "Website enquiry";
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form onSubmit={onSubmit}>
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

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-brand-black px-7 py-3 font-body text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray"
        >
          Submit
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="font-body text-[12px] text-brand-gray" aria-live="polite">
          {opened
            ? `Your email app should have opened. If not, email us at ${site.email}.`
            : "Sending opens your email app with the message ready to go."}
        </p>
      </div>
    </form>
  );
}
