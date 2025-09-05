import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No products found matching your criteria.
        </p>
        <Link href="/products">
          <Button>Browse All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group hover:shadow-lg transition-all duration-300"
        >
          <CardHeader className="p-4">
            <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* <Badge className="absolute top-2 right-2 bg-primary">Score: {product.score}</Badge> */}
              {product.originalPrice && (
                <Badge variant="destructive" className="absolute top-2 left-2">
                  Sale
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {product.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {product.brand}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">
                {product.name}
              </CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {product.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  product.inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-bold">${product.price}</div>
                {product.originalPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/products/${product.category}/${product.id}`}
                className="flex-1"
              >
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                disabled={!product.inStock}
                className="px-3 bg-transparent"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
