import { ProductFilters } from "@/components/product-filters";
import { Filter } from "lucide-react";
export function ProductsSidebar({ filters }) {
  return (
    <aside className="lg:w-64 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-24">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-2">
          <ProductFilters currentFilters={filters} />
        </div>
      </div>
    </aside>
  );
}