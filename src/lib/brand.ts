/**
 * Central brand + currency config.
 * Rebrand or re-price the whole storefront by editing this one file.
 */
export const BRAND = {
  name: "Cartelo",
  /** Two-tone wordmark: logo renders <prefix> then <suffix> in the accent color. */
  wordmarkPrefix: "Cart",
  wordmarkSuffix: "elo",
  supportEmail: "help@cartelo.co",
} as const;

export const CURRENCY = {
  symbol: "$",
  locale: "en-US",
  code: "USD",
  /** Catalog amounts are stored in INR; multiply by this to display. */
  inrRate: 1 / 83,
} as const;
