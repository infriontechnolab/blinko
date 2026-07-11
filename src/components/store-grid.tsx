import type { Store } from "@/lib/mock-data";
import { StoreCard } from "@/components/store-card";

export function StoreGrid({ stores }: { stores: Store[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stores.map((v) => (
        <StoreCard key={v.id} store={v} />
      ))}
    </div>
  );
}
