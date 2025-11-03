import { ProductsSidebar } from "@/components/products/products-sidebar";
import { ProductsContent } from "@/components/products/products-content";
import type { Product } from "@/lib/types";
import type { SearchFilters } from "@/lib/types";

export function ProductsLayout({ products, filters }: { products: Product[], filters: SearchFilters } ) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <ProductsSidebar filters={filters} />
      <ProductsContent products={products} />
    </div>
  );
}
