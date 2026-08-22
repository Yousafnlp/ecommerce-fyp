import { ProductFilters, ClearFiltersButton } from "@/components/shared/product-filters";
import { Filter } from "lucide-react";

export function ProductsSidebar({ filters }) {
  const filterKey = JSON.stringify(filters);
  return (
    <aside className="lg:w-64 lg:flex-shrink-0">
      <div className="flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)]">
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <div className="w-8 h-8 bg-gradient-brand-soft rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-primary dark:text-primary-foreground" />
          </div>
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="flex-1 min-h-0 lg:overflow-y-auto pr-2 overscroll-contain">
          <ProductFilters key={filterKey} currentFilters={filters} />
        </div>

        <div className="shrink-0 mt-4 pt-4 border-t border-border/60 bg-background/80 backdrop-blur-sm">
          <ClearFiltersButton />
        </div>
      </div>
    </aside>
  );
}
