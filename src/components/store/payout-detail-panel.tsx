import { X } from "lucide-react";
import { formatPrice } from "@/lib/cart-store";
import type { Payout } from "@/lib/store/vendor-demo-payouts-seed";
import {
  PAYOUT_STATUS_META,
  formatPayoutDate,
  formatPayoutPeriod,
} from "@/lib/store/vendor-payout-status";
import { Badge } from "@/components/ui/badge";

export function PayoutDetailPanel({ payout, onClose }: { payout: Payout; onClose: () => void }) {
  const meta = PAYOUT_STATUS_META[payout.status];

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-surface md:w-[420px]">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-lg font-bold">{formatPayoutPeriod(payout)}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold">{payout.id}</span>
            <Badge variant="outline" className={`border-transparent ${meta.badgeClass}`}>
              {meta.label}
            </Badge>
          </div>
          <div className="mt-4 text-sm">
            <p className="text-xs text-muted-foreground">Net payout</p>
            <p className="mt-1 text-2xl font-bold">{formatPrice(payout.netPayout)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Breakdown
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gross sales</span>
              <span className="font-medium">{formatPrice(payout.grossSales)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-medium">-{formatPrice(payout.commission)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Adjustments</span>
              <span className="font-medium">
                {payout.adjustments === 0 ? "—" : formatPrice(payout.adjustments)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold">Net payout</span>
              <span className="text-lg font-bold">{formatPrice(payout.netPayout)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Settlement
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="mt-1 font-medium">{formatPayoutPeriod(payout)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {payout.status === "paid" ? "Paid on" : "Expected on"}
              </p>
              <p className="mt-1 font-medium">
                {payout.paidOn
                  ? formatPayoutDate(payout.paidOn)
                  : payout.expectedOn
                    ? formatPayoutDate(payout.expectedOn)
                    : "Week in progress"}
              </p>
            </div>
            {payout.transactionRef ? (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Transaction reference</p>
                <p className="mt-1 font-mono font-medium">{payout.transactionRef}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
