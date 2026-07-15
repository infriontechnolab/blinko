/**
 * Vendor portal routes live under /store/* alongside the customer-facing
 * /store/$slug storefront page, so this list of concrete prefixes is how the
 * root layout tells them apart to skip the customer SiteHeader/SiteFooter.
 */
const VENDOR_PATH_PREFIXES = [
  "/store/login",
  "/store/dashboard",
  "/store/products",
  "/store/orders",
  "/store/inventory",
  "/store/slots",
  "/store/coupons",
  "/store/reports",
  "/store/payouts",
  "/store/profile",
];

export function isVendorPortalPath(pathname: string) {
  return VENDOR_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
