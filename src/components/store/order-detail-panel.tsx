import { useState } from "react";
import { X } from "lucide-react";
import { getProduct } from "@/lib/mock-data";
import { formatPrice } from "@/lib/cart-store";
import { OrderChatBox } from "@/components/order-chat-box";
import { StatusPill } from "@/components/store/status-pill";
import { VendorOrderStatusStepper } from "@/components/store/vendor-order-status-stepper";
import { useVendorOrdersActions, type VendorOrder } from "@/lib/store/vendor-orders-store";
import { VENDOR_STATUS_META } from "@/lib/store/vendor-order-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const nextActionLabel: Record<string, string> = {
  accepted: "Start preparing",
  preparing: "Mark packed",
  packed: "Mark ready for delivery",
};

const TERMINAL_STATUSES = ["delivered", "rejected", "cancelled"];

/** Ready for pickup is the last vendor-facing step — no further action button after it. */
const NO_ACTION_STATUSES = [...TERMINAL_STATUSES, "ready_for_delivery"];

export function OrderDetailPanel({ order, onClose }: { order: VendorOrder; onClose: () => void }) {
  const { acceptOrder, rejectOrder, advanceStatus, startPreparing, cancelOrder, canCancel } =
    useVendorOrdersActions();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [prepOpen, setPrepOpen] = useState(false);
  const [preparerName, setPreparerName] = useState("");
  const [preparerMobile, setPreparerMobile] = useState("");

  const isPlaced = order.vendorStatus === "placed";
  const isAccepted = order.vendorStatus === "accepted";
  const isActive = !NO_ACTION_STATUSES.includes(order.vendorStatus);
  const showCancel = canCancel(order.vendorStatus);

  const canSubmitPrep = preparerName.trim() !== "" && /^\d{10}$/.test(preparerMobile.trim());

  const confirmPreparing = () => {
    if (!canSubmitPrep) return;
    startPreparing(order.id, { name: preparerName.trim(), mobile: preparerMobile.trim() });
    setPrepOpen(false);
    setPreparerName("");
    setPreparerMobile("");
  };

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-surface md:w-[420px]">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-lg font-bold">Order #{order.id}</h2>
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
            <span className="font-mono text-sm font-semibold">#{order.id}</span>
            <StatusPill status={order.vendorStatus} />
          </div>
          <div className="mt-4 text-sm">
            <p className="text-xs text-muted-foreground">Placed</p>
            <p className="mt-1 font-medium">{new Date(order.placedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Status
          </p>
          <VendorOrderStatusStepper status={order.vendorStatus} />
          {order.preparer ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Preparing by{" "}
              <span className="font-medium text-foreground">{order.preparer.name}</span> •{" "}
              {order.preparer.mobile}
            </p>
          ) : null}
        </div>

        {order.vendorStatus === "preparing" ? (
          <OrderChatBox orderId={order.id} sender="vendor" title="Chat with customer" />
        ) : null}

        <div className="rounded-2xl border border-border p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Items from your store
          </p>
          <div className="divide-y divide-border">
            {order.items.map((item) => {
              const product = getProduct(item.productId);
              return (
                <div key={item.productId} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {product ? (
                      <img
                        src={product.image}
                        alt=""
                        className="size-11 shrink-0 rounded-lg border border-border object-contain"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {product?.name ?? item.productId}
                      </p>
                      <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold">Your subtotal</span>
            <span className="text-lg font-bold">{formatPrice(order.subtotal)}</span>
          </div>
        </div>
      </div>

      {isPlaced ? (
        <div className="flex items-center gap-3 border-t border-border p-5">
          <Button onClick={() => acceptOrder(order.id)} className="flex-1 rounded-full">
            Accept order
          </Button>
          <Button
            variant="outline"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={() => rejectOrder(order.id)}
          >
            Reject
          </Button>
        </div>
      ) : isActive ? (
        <div className="flex items-center gap-3 border-t border-border p-5">
          <Button
            onClick={() => (isAccepted ? setPrepOpen(true) : advanceStatus(order.id))}
            className="flex-1 rounded-full"
          >
            {nextActionLabel[order.vendorStatus]}
          </Button>
          {showCancel ? (
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The customer will see this order as cancelled. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      cancelOrder(order.id);
                      setCancelOpen(false);
                    }}
                  >
                    Cancel order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      ) : (
        <div className="border-t border-border p-5">
          <p className="text-center text-sm font-medium text-muted-foreground">
            {VENDOR_STATUS_META[order.vendorStatus].label}
          </p>
        </div>
      )}

      <Dialog open={prepOpen} onOpenChange={setPrepOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who's preparing this order?</DialogTitle>
            <DialogDescription>
              Enter the preparer's name and mobile number to move this order to Preparing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="preparer-name">Name</Label>
              <Input
                id="preparer-name"
                value={preparerName}
                onChange={(e) => setPreparerName(e.target.value)}
                placeholder="Preparer's name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preparer-mobile">Mobile number</Label>
              <Input
                id="preparer-mobile"
                value={preparerMobile}
                onChange={(e) => setPreparerMobile(e.target.value)}
                placeholder="10-digit mobile number"
                inputMode="numeric"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={confirmPreparing} disabled={!canSubmitPrep} className="rounded-full">
              Start preparing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
