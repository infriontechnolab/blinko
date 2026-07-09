/**
 * Central brand + currency config.
 * Rebrand or re-price the whole storefront by editing this one file.
 */
export const BRAND = {
  name: "Blinko",
  /** Two-tone wordmark: logo renders <prefix> then <suffix> in the accent color. */
  wordmarkPrefix: "Blink",
  wordmarkSuffix: "o",
  /** Full logo lockup + square icon live in /public. */
  logo: "/blinko-logo.png",
  icon: "/blinko-icon.png",
  supportEmail: "help@blinko.co",
} as const;

export const CURRENCY = {
  symbol: "$",
  locale: "en-US",
  code: "USD",
  /** Catalog amounts are stored in INR; multiply by this to display. */
  inrRate: 1 / 83,
} as const;
