import { XCircle } from "lucide-react";
import { VENDOR_STATUS_SEQUENCE, type VendorOrderStatus } from "@/lib/store/vendor-orders-store";
import { VENDOR_STATUS_META } from "@/lib/store/vendor-order-status";

export function VendorOrderStatusStepper({ status }: { status: VendorOrderStatus }) {
  if (status === "cancelled" || status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
        <XCircle className="size-4" />
        Order {status === "cancelled" ? "cancelled" : "rejected"}
      </div>
    );
  }

  const currentIndex = VENDOR_STATUS_SEQUENCE.indexOf(status);
  const progressPct = (currentIndex / (VENDOR_STATUS_SEQUENCE.length - 1)) * 100;

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[300px]">
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border" />
        <div
          className="absolute left-4 top-4 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `calc((100% - 2rem) * ${progressPct / 100})` }}
        />
        <ol className="relative grid grid-cols-6 gap-1">
          {VENDOR_STATUS_SEQUENCE.map((step, i) => {
            const meta = VENDOR_STATUS_META[step];
            const Icon = meta.icon;
            const done = i <= currentIndex;
            const active = i === currentIndex;
            return (
              <li key={step} className="flex flex-col items-center text-center">
                <div
                  className={`relative grid size-8 place-items-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {active && status !== "delivered" ? (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                  ) : null}
                </div>
                <p
                  className={`mt-2 text-[10px] font-medium leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {meta.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
