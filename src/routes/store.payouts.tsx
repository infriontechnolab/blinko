import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/cart-store";
import { VendorProviders } from "@/components/store/vendor-providers";
import { VendorAuthGuard } from "@/components/store/vendor-auth-guard";
import { VendorShell } from "@/components/store/vendor-shell";
import { PayoutDetailPanel } from "@/components/store/payout-detail-panel";
import { useVendorAuth } from "@/lib/store/vendor-auth-store";
import { payoutsForStore } from "@/lib/store/vendor-demo-payouts-seed";
import {
  PAYOUT_STATUS_META,
  formatPayoutDate,
  formatPayoutPeriod,
} from "@/lib/store/vendor-payout-status";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const searchSchema = z.object({ payout: z.string().optional() });

export const Route = createFileRoute("/store/payouts")({
  head: () => ({ meta: [{ title: `Payouts — ${BRAND.name} Vendor Portal` }] }),
  validateSearch: searchSchema,
  component: () => (
    <VendorProviders>
      <VendorAuthGuard>
        <VendorShell>
          <PayoutsContent />
        </VendorShell>
      </VendorAuthGuard>
    </VendorProviders>
  ),
});

function PayoutsContent() {
  const { session } = useVendorAuth();
  const storeId = session!.storeId;
  const payouts = payoutsForStore(storeId);
  const { payout: selectedId } = Route.useSearch();
  const navigate = useNavigate();

  const selectPayout = (id: string | undefined) =>
    navigate({ to: "/store/payouts", search: id ? { payout: id } : {} });

  const paidPayouts = payouts.filter((p) => p.status === "paid");
  const totalPaidOut = paidPayouts.reduce((sum, p) => sum + p.netPayout, 0);
  const nextPayout =
    payouts.find((p) => p.status === "processing") ?? payouts.find((p) => p.status === "upcoming");
  const currentWeek = payouts.find((p) => p.status === "upcoming");

  const sorted = [...payouts].sort((a, b) => (a.periodStart < b.periodStart ? 1 : -1));
  const selectedPayout = payouts.find((p) => p.id === selectedId);

  return (
    <div className="flex h-full min-h-0 flex-1">
      <div
        className={`min-w-0 flex-1 flex-col overflow-y-auto p-6 md:p-8 ${selectedPayout ? "hidden md:flex" : "flex"}`}
      >
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Weekly settlements from the {BRAND.name} admin team — each Mon–Sun sales week is paid out
          a few business days after it closes.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-muted-foreground">Next payout</p>
            <p className="mt-1 text-2xl font-bold">
              {nextPayout ? formatPrice(nextPayout.netPayout) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {nextPayout?.status === "processing" && nextPayout.expectedOn
                ? `Expected ${formatPayoutDate(nextPayout.expectedOn)}`
                : nextPayout
                  ? `Week in progress · ${formatPayoutPeriod(nextPayout)}`
                  : "No payout scheduled"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-muted-foreground">Total paid out</p>
            <p className="mt-1 text-2xl font-bold">{formatPrice(totalPaidOut)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {paidPayouts.length} settled cycles
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-muted-foreground">This week's sales</p>
            <p className="mt-1 text-2xl font-bold">
              {currentWeek ? formatPrice(currentWeek.grossSales) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Updates daily until the week closes
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-bold">Transaction history</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Gross sales</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Adjustments</TableHead>
                <TableHead>Net payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid on / Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p) => {
                const meta = PAYOUT_STATUS_META[p.status];
                return (
                  <TableRow
                    key={p.id}
                    onClick={() => selectPayout(p.id)}
                    className={`cursor-pointer ${selectedId === p.id ? "bg-muted" : ""}`}
                  >
                    <TableCell className="font-medium">{formatPayoutPeriod(p)}</TableCell>
                    <TableCell>{formatPrice(p.grossSales)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      -{formatPrice(p.commission)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.adjustments === 0 ? "—" : formatPrice(p.adjustments)}
                    </TableCell>
                    <TableCell className="font-semibold">{formatPrice(p.netPayout)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-transparent ${meta.badgeClass}`}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.status === "paid" && p.paidOn
                        ? `${formatPayoutDate(p.paidOn)} · ${p.transactionRef}`
                        : p.status === "processing" && p.expectedOn
                          ? `Expected ${formatPayoutDate(p.expectedOn)}`
                          : "In progress"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedPayout ? (
        <PayoutDetailPanel payout={selectedPayout} onClose={() => selectPayout(undefined)} />
      ) : null}
    </div>
  );
}
