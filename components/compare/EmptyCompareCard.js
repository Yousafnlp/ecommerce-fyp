import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductSuggestionGrid } from "./ProductSuggestionGrid";
export function EmptyCompareCard({
  products
}) {
  return <Card>
      <CardHeader>
        <CardTitle>No Products Selected</CardTitle>
        <CardDescription>
          Choose products to compare their specifications and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProductSuggestionGrid products={products.slice(0, 6)} />
        <Link href="/products">
          <Button>Browse All Products</Button>
        </Link>
      </CardContent>
    </Card>;
}