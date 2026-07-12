import type { ReactNode } from "react";
import { VendorAuthProvider } from "@/lib/store/vendor-auth-store";
import { VendorProductsProvider } from "@/lib/store/vendor-products-store";
import { VendorOrdersProvider } from "@/lib/store/vendor-orders-store";
import { VendorStoreProfileProvider } from "@/lib/store/vendor-store-profile-store";
import { VendorBrandsProvider } from "@/lib/store/vendor-brands-store";
import { VendorProductVariantsProvider } from "@/lib/store/vendor-product-variants-store";
import { VendorPurchaseEntriesProvider } from "@/lib/store/vendor-purchase-entries-store";
import { VendorSlotsProvider } from "@/lib/store/vendor-slots-store";
import { VendorCouponsProvider } from "@/lib/store/vendor-coupons-store";

/**
 * Scoped provider stack for the /store/* vendor portal, deliberately kept out
 * of the global root providers since this state is irrelevant to the ~10
 * customer-facing routes — each vendor route wraps itself with this instead.
 */
export function VendorProviders({ children }: { children: ReactNode }) {
  return (
    <VendorAuthProvider>
      <VendorStoreProfileProvider>
        <VendorBrandsProvider>
          <VendorProductsProvider>
            <VendorProductVariantsProvider>
              <VendorPurchaseEntriesProvider>
                <VendorSlotsProvider>
                  <VendorCouponsProvider>
                    <VendorOrdersProvider>{children}</VendorOrdersProvider>
                  </VendorCouponsProvider>
                </VendorSlotsProvider>
              </VendorPurchaseEntriesProvider>
            </VendorProductVariantsProvider>
          </VendorProductsProvider>
        </VendorBrandsProvider>
      </VendorStoreProfileProvider>
    </VendorAuthProvider>
  );
}
