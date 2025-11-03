import { ProductGrid } from "@/components/product-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function CategoryProducts({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No products found in this category.
        </p>
        <Link href="/products">
          <Button>Browse All Products</Button>
        </Link>
      </div>
    );
  }

  return <ProductGrid products={products} />;
}
