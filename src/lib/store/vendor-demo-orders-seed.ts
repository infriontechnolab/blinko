import { getProduct, type Order } from "@/lib/mock-data";

/**
 * Extra demo orders for the Spice Hub vendor dashboard/order-management
 * views, kept entirely separate from `mock-data.ts`'s `pastOrders` (which the
 * customer-facing "My Orders" page also reads) so seeding volume here can
 * never leak into or alter the customer module.
 */
const PRODUCT_IDS = [
  "am-oil",
  "in-daawat",
  "in-vadilal",
  "in-rusk",
  "in-goodday",
  "ca-shana-paratha",
  "ca-verka-rusk",
  "ca-golden-temple-atta",
  "ca-haldirams-boondi",
  "ca-aashirvaad-atta",
  "ca-nanak-kebab",
];

const ADDRESSES = [
  "21 Queen Mary Drive, Brampton ON L7A 1X7",
  "88 Kennedy Rd S, Brampton ON L6W 3P4",
  "150 Bramalea Rd, Brampton ON L6T 2W8",
  "45 Main St N, Brampton ON L6X 1N4",
];

function buildOrder(index: number): Order {
  const primaryId = PRODUCT_IDS[index % PRODUCT_IDS.length];
  const secondaryId = PRODUCT_IDS[(index + 5) % PRODUCT_IDS.length];
  const primary = getProduct(primaryId)!;
  const secondary = getProduct(secondaryId)!;
  const includeSecondary = index % 2 === 0;

  const items = includeSecondary
    ? [
        { productId: primaryId, qty: (index % 3) + 1, price: primary.price },
        { productId: secondaryId, qty: ((index + 1) % 2) + 1, price: secondary.price },
      ]
    : [{ productId: primaryId, qty: (index % 4) + 1, price: primary.price }];

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const delivery = subtotal >= 3000 ? 0 : 49;

  // Spread across mid-June through early July 2026, safely before the app's
  // "current date" so no demo order ever appears to be placed in the future.
  const month = index < 20 ? "06" : "07";
  const day = index < 20 ? 1 + index : 1 + (index - 20);
  const hour = 9 + (index % 11);
  const minute = (index * 7) % 60;
  const placedAt = `2026-${month}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;

  return {
    id: `SH-${1001 + index}`,
    placedAt,
    items,
    subtotal,
    delivery,
    total: subtotal + delivery,
    status: "delivered",
    address: ADDRESSES[index % ADDRESSES.length],
  };
}

export const SPICE_HUB_DEMO_ORDERS: Order[] = Array.from({ length: 30 }, (_, i) => buildOrder(i));
