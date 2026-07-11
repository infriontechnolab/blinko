import type { SyntheticEvent } from "react";

// Neutral placeholder shown when a product image URL fails to load (e.g. a
// hotlink-protected retailer CDN, or a local asset not yet dropped in).
export const IMG_FALLBACK =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='240'%20height='240'%3E%3Crect%20width='240'%20height='240'%20fill='%23f2efe9'/%3E%3Ctext%20x='120'%20y='128'%20font-family='sans-serif'%20font-size='16'%20fill='%23b3a99a'%20text-anchor='middle'%3ENo%20image%3C/text%3E%3C/svg%3E";

/** onError handler that swaps in the placeholder once, guarded against loops. */
export function onImgError(e: SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.dataset.fallback) return;
  el.dataset.fallback = "1";
  el.src = IMG_FALLBACK;
}
