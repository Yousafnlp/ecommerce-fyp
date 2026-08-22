import { Database } from "@/lib/database";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { formatPrice } from "@/lib/utils";
const FeatureProducts = async () => {
  const featuredProducts = await Database.getFeaturedProducts();
  return <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Top-rated products with the highest SpecSmart scores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, i) => <Card key={product.id} className="group hover:shadow-[var(--shadow-lift)] hover:border-ring/30 transition-all duration-300 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <CardHeader className="p-4">
                <div className="aspect-square relative mb-4 overflow-hidden rounded-xl bg-muted/60">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {product.brand}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[var(--color-star)] text-[var(--color-star)]" />
                    <span className="text-sm font-medium">
                      {product.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatPrice(product.price)}</div>
                    {product.originalPrice && <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </div>}
                  </div>
                </div>
                <Link href={`/products/${product.category}/${product.id}`}>
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default FeatureProducts;