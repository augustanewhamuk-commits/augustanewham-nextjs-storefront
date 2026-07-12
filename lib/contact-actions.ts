/**
 * Contact form server action — delivers the message straight to the brand
 * mailbox over SMTP, so the visitor never leaves the site.
 *
 * Sends through the Namecheap Private Email mailbox itself (no third-party
 * email service): host mail.privateemail.com, authenticated as the mailbox.
 * The message is From/To the mailbox with the visitor's address as Reply-To,
 * so replying in webmail goes to the customer.
 *
 * Hardening: honeypot field, per-IP rate limit (in-memory per server
 * instance — enough to blunt casual abuse without a KV store), retries on
 * transient SMTP failures with tight socket timeouts so the visitor gets an
 * answer quickly, and typed error codes so the UI can phrase each case.
 *
 * Env (see .env.example):
 *   CONTACT_SMTP_USER  the mailbox, e.g. contactus@augustanewham.com
 *   CONTACT_SMTP_PASS  the mailbox password (or app password)
 *   CONTACT_SMTP_HOST  optional, defaults to mail.privateemail.com
 *   CONTACT_SMTP_PORT  optional, defaults to 465 (SSL)
 */
"use server";

import { headers } from "next/headers";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/lib/site";

export type ContactErrorCode = "invalid_input" | "rate_limited" | "send_failed";

export type ContactResult =
  | { ok: true }
  | { ok: false; code: ContactErrorCode; error: string };

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
  /** Honeypot — humans never fill this; bots do. */
  company?: string;
};

/* ------------------------------------------------------------------ */
/* Rate limiting (per IP, sliding window, in-memory)                   */
/* ------------------------------------------------------------------ */

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX_SENDS = 3;
/** Send timestamps per IP within the current window. */
const recentSends = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const stamps = (recentSends.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (stamps.length >= RATE_MAX_SENDS) {
    recentSends.set(ip, stamps);
    return true;
  }
  stamps.push(now);
  recentSends.set(ip, stamps);
  // Keep the map bounded: drop IPs whose window has fully expired.
  if (recentSends.size > 500) {
    for (const [key, times] of recentSends) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) recentSends.delete(key);
    }
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* SMTP send with retry                                                */
/* ------------------------------------------------------------------ */

/**
 * Failures worth retrying: network hiccups and 4xx SMTP "try again later"
 * responses. Auth/config errors (535, missing creds) are permanent — retrying
 * only delays the visitor's error message.
 */
const TRANSIENT_ERROR =
  /ETIMEDOUT|ECONNRESET|ECONNREFUSED|ECONNECTION|ESOCKET|EDNS|EPIPE|\b(421|450|451|452)\b/;

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 400;

async function sendWithRetry(
  transporter: Transporter,
  mail: Parameters<Transporter["sendMail"]>[0],
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await transporter.sendMail(mail);
      return;
    } catch (error) {
      lastError = error;
      const details =
        error instanceof Error
          ? `${(error as NodeJS.ErrnoException).code ?? ""} ${error.message}`
          : String(error);
      console.error(`Contact form: send attempt ${attempt} failed —`, details);
      if (!TRANSIENT_ERROR.test(details) || attempt === MAX_ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, BACKOFF_MS * attempt));
    }
  }
  throw lastError;
}

/* ------------------------------------------------------------------ */
/* Action                                                              */
/* ------------------------------------------------------------------ */

const SEND_FAILED = `We couldn't send your message right now. Please try again in a moment, or email us directly at ${site.email}.`;

export async function sendContactAction(input: ContactInput): Promise<ContactResult> {
  // Honeypot tripped: pretend it worked, deliver nothing.
  if (input.company) return { ok: true };

  const name = input.name?.trim();
  const email = input.email?.trim();
  const message = input.message?.trim();
  if (!name || !email || !message) {
    return {
      ok: false,
      code: "invalid_input",
      error: "Please fill in your name, email and message.",
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return {
      ok: false,
      code: "invalid_input",
      error: "Please enter a valid email address.",
    };
  }
  if (message.length > 5000) {
    return {
      ok: false,
      code: "invalid_input",
      error: "Your message is too long — please keep it under 5,000 characters.",
    };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return {
      ok: false,
      code: "rate_limited",
      error: `You've sent a few messages in a row — please wait a few minutes and try again, or email us at ${site.email}.`,
    };
  }

  const user = process.env.CONTACT_SMTP_USER;
  const pass = process.env.CONTACT_SMTP_PASS;
  if (!user || !pass) {
    console.error("Contact form: CONTACT_SMTP_USER/CONTACT_SMTP_PASS not set");
    return { ok: false, code: "send_failed", error: SEND_FAILED };
  }

  // `||` not `??`: an empty `CONTACT_SMTP_HOST=` line in .env still defaults.
  const port = Number(process.env.CONTACT_SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST || "mail.privateemail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    // Fail fast — the visitor is waiting on this round-trip.
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
  });

  const interest = input.interest?.trim();
  const phone = input.phone?.trim();
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    interest ? `Interested in: ${interest}` : null,
    "",
    message,
  ].filter((line): line is string => line !== null);

  try {
    await sendWithRetry(transporter, {
      from: `"${site.name} website" <${user}>`,
      to: site.email,
      replyTo: `"${name.replace(/["\\]/g, "")}" <${email}>`,
      subject: interest ? `Website enquiry — ${interest}` : "Website enquiry",
      text: lines.join("\n"),
    });
    return { ok: true };
  } catch {
    // Already logged per attempt in sendWithRetry.
    return { ok: false, code: "send_failed", error: SEND_FAILED };
  }
}
