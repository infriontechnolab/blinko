import { VENDOR_STATUS_META } from "@/lib/store/vendor-order-status";
import type { VendorOrderStatus } from "@/lib/store/vendor-orders-store";

export function StatusPill({ status }: { status: VendorOrderStatus }) {
  const meta = VENDOR_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
    >
      {meta.label}
    </span>
  );
}
