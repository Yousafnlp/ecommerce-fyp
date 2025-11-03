// components/products/products-content.tsx
import { ProductGrid } from "@/components/product-grid";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductsContent({ products }: { products: Product[] }) {
  return (
    <main className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} products
        </p>
        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Advanced Search
            </Button>
          </Link>
        </div>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}
