import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((relatedProduct) => (
          <Card
            key={relatedProduct.id}
            className="group hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="p-4">
              <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={relatedProduct.image || "/placeholder.svg"}
                  alt={relatedProduct.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardTitle className="text-base line-clamp-2">
                {relatedProduct.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {relatedProduct.brand}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{relatedProduct.rating}</span>
                </div>
                <div className="text-lg font-bold">${relatedProduct.price}</div>
              </div>
              <Link
                href={`/products/${relatedProduct.category}/${relatedProduct.id}`}
              >
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
