import {
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  PackageCheck,
  Truck,
  PartyPopper,
  Ban,
} from "lucide-react";
import type { VendorOrderStatus } from "@/lib/store/vendor-orders-store";

/**
 * Single source of truth for how each vendor order status (PRD 6.5 workflow:
 * Placed -> Accepted/Rejected -> Preparing -> Packed -> Ready for Delivery ->
 * Delivered, plus Cancelled) is labeled, colored and iconified across the
 * dashboard, orders list, filter tabs, status stepper and detail panel.
 */
export const VENDOR_STATUS_META: Record<
  VendorOrderStatus,
  { label: string; badgeClass: string; icon: typeof Clock }
> = {
  placed: { label: "Placed", badgeClass: "bg-muted text-muted-foreground", icon: Clock },
  accepted: { label: "Accepted", badgeClass: "bg-accent/10 text-accent", icon: CheckCircle2 },
  rejected: { label: "Rejected", badgeClass: "bg-destructive/10 text-destructive", icon: Ban },
  preparing: { label: "Preparing", badgeClass: "bg-primary/10 text-primary", icon: ChefHat },
  packed: { label: "Packed", badgeClass: "bg-primary/20 text-primary", icon: PackageCheck },
  ready_for_delivery: {
    label: "Ready for Delivery",
    badgeClass: "bg-primary text-primary-foreground",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    badgeClass: "bg-success text-success-foreground",
    icon: PartyPopper,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};
