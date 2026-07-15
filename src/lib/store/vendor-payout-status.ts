import type { Payout, PayoutStatus } from "@/lib/store/vendor-demo-payouts-seed";

/** Single source of truth for how each payout status is labeled/colored across the list and detail panel. */
export const PAYOUT_STATUS_META: Record<PayoutStatus, { label: string; badgeClass: string }> = {
  paid: { label: "Paid", badgeClass: "bg-success/10 text-success" },
  processing: { label: "Processing", badgeClass: "bg-primary/10 text-primary" },
  upcoming: { label: "Upcoming", badgeClass: "bg-muted text-muted-foreground" },
};

export function formatPayoutDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPayoutPeriod(p: Payout) {
  return `${formatPayoutDate(p.periodStart)} – ${formatPayoutDate(p.periodEnd)}`;
}
