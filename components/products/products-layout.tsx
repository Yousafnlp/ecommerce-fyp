import { ProductsSidebar } from "@/components/products/products-sidebar";
import { ProductsContent } from "@/components/products/products-content";

export function ProductsLayout({ products, filters }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <ProductsSidebar filters={filters} />
      <ProductsContent products={products} />
    </div>
  );
}
