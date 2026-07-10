/**
 * Shared form styling tokens for the auth screens (login / register / password).
 * Mirrors the field styling used in AccountDashboard so the account area reads as
 * one consistent surface.
 */
export const fieldLabel =
  "block font-body text-[11px] uppercase tracking-[0.18em] text-brand-gray";

export const fieldInput =
  "mt-2 w-full appearance-none rounded-none border border-brand-light-gray bg-brand-white px-4 py-2.5 font-body text-[15px] text-brand-black outline-none transition-colors focus:border-brand-black";

export const primaryButton =
  "inline-flex w-full items-center justify-center bg-brand-black px-7 py-3 font-wordmark text-[12px] uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-gray disabled:opacity-50";

export const errorText = "font-body text-[12px] leading-relaxed text-red-700";

export const successText = "font-body text-[13px] leading-relaxed text-brand-black";
