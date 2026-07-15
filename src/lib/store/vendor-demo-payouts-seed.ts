export type PayoutStatus = "paid" | "processing" | "upcoming";

export type Payout = {
  id: string;
  periodStart: string;
  periodEnd: string;
  /** Date funds actually settled — set once status is "paid". */
  paidOn?: string;
  /** Projected settlement date for a cycle that hasn't paid out yet. */
  expectedOn?: string;
  grossSales: number;
  commission: number;
  /** Refunds/chargebacks netted against the cycle — usually 0 or negative. */
  adjustments: number;
  netPayout: number;
  status: PayoutStatus;
  transactionRef?: string;
};

/**
 * Weekly payout cycles (Mon–Sun) — the admin team settles each closed sales
 * week a few business days later. Dates are fixed strings around the app's
 * "current date" (2026-07-15) so history reads as paid, the most recently
 * closed week reads as processing, and the in-progress week reads as
 * upcoming — never relying on Date.now().
 */
const SPICE_HUB_PAYOUTS: Payout[] = [
  {
    id: "PO-SH-0001",
    periodStart: "2026-05-25",
    periodEnd: "2026-05-31",
    paidOn: "2026-06-03",
    grossSales: 24500,
    commission: 2940,
    adjustments: -350,
    netPayout: 21210,
    status: "paid",
    transactionRef: "UTR260603A1B7F2",
  },
  {
    id: "PO-SH-0002",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-07",
    paidOn: "2026-06-10",
    grossSales: 27800,
    commission: 3336,
    adjustments: 0,
    netPayout: 24464,
    status: "paid",
    transactionRef: "UTR260610C48D19",
  },
  {
    id: "PO-SH-0003",
    periodStart: "2026-06-08",
    periodEnd: "2026-06-14",
    paidOn: "2026-06-17",
    grossSales: 19600,
    commission: 2352,
    adjustments: -180,
    netPayout: 17068,
    status: "paid",
    transactionRef: "UTR260617E9F203",
  },
  {
    id: "PO-SH-0004",
    periodStart: "2026-06-15",
    periodEnd: "2026-06-21",
    paidOn: "2026-06-24",
    grossSales: 31200,
    commission: 3744,
    adjustments: -600,
    netPayout: 26856,
    status: "paid",
    transactionRef: "UTR260624B67A44",
  },
  {
    id: "PO-SH-0005",
    periodStart: "2026-06-22",
    periodEnd: "2026-06-28",
    paidOn: "2026-07-01",
    grossSales: 28950,
    commission: 3474,
    adjustments: 0,
    netPayout: 25476,
    status: "paid",
    transactionRef: "UTR260701F1D890",
  },
  {
    id: "PO-SH-0006",
    periodStart: "2026-06-29",
    periodEnd: "2026-07-05",
    paidOn: "2026-07-08",
    grossSales: 33400,
    commission: 4008,
    adjustments: -420,
    netPayout: 28972,
    status: "paid",
    transactionRef: "UTR260708D25C6B",
  },
  {
    id: "PO-SH-0007",
    periodStart: "2026-07-06",
    periodEnd: "2026-07-12",
    expectedOn: "2026-07-17",
    grossSales: 26150,
    commission: 3138,
    adjustments: 0,
    netPayout: 23012,
    status: "processing",
  },
  {
    id: "PO-SH-0008",
    periodStart: "2026-07-13",
    periodEnd: "2026-07-19",
    grossSales: 9800,
    commission: 1176,
    adjustments: 0,
    netPayout: 8624,
    status: "upcoming",
  },
];

export function payoutsForStore(storeId: string): Payout[] {
  return storeId === "spice-hub" ? SPICE_HUB_PAYOUTS : [];
}
