  import { ProductFilters } from "@/components/product-filters";
import { Filter } from "lucide-react";
import type { SearchFilters } from "@/lib/types";

export function ProductsSidebar({ filters }: { filters: SearchFilters }) {
  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="sticky top-24">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        <ProductFilters currentFilters={filters} />
      </div>
    </aside>
  );
}
