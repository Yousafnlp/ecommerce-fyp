"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export function ComparisonTable({
  products
}) {
  const maxProducts = 4;
  const canAddMore = products.length < maxProducts;
  const removeProduct = productId => {
    const remaining = products.filter(p => p.id !== productId).map(p => p.id);
    const newUrl = remaining.length > 0 ? `/compare?products=${remaining.join(",")}` : "/compare";
    window.location.href = newUrl;
  };
  return <div className="space-y-6">
      {/* Product Headers */}
      <div className="grid gap-4" style={{
      gridTemplateColumns: `200px repeat(${products.length}, 1fr)`
    }}>
        <div className="font-semibold text-lg">Products</div>
        {products.map(product => <Card key={product.id}>
            <CardHeader className="p-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeProduct(product.id)}>
                  <X className="w-3 h-3" />
                </Button>
                <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-muted">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <CardTitle className="text-base line-clamp-2 mb-1">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-2">
                  {product.brand}
                </p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary">Score: {product.score}</Badge>
                  <div className="text-lg font-bold">${product.price}</div>
                </div>
              </div>
            </CardHeader>
          </Card>)}
        {canAddMore && <Card className="border-dashed">
            <CardContent className="p-4 flex items-center justify-center h-full min-h-[200px]">
              <Link href="/products">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {/* Basic Info */}
                <tr className="border-b bg-muted/50">
                  <td className="p-4 font-semibold w-48">Basic Information</td>
                  {products.map(product => <td key={product.id} className="p-4"></td>)}
                </tr>

                <tr className="border-b">
                  <td className="p-4 text-muted-foreground">Price</td>
                  {products.map(product => <td key={product.id} className="p-4 font-semibold">
                      ${product.price}
                    </td>)}
                </tr>

                <tr className="border-b">
                  <td className="p-4 text-muted-foreground">SpecSmart Score</td>
                  {products.map(product => <td key={product.id} className="p-4">
                      <Badge className="bg-primary">{product.score}/100</Badge>
                    </td>)}
                </tr>

                <tr className="border-b">
                  <td className="p-4 text-muted-foreground">Brand</td>
                  {products.map(product => <td key={product.id} className="p-4">
                      {product.brand}
                    </td>)}
                </tr>

                {/* Specifications */}
                <tr className="border-b bg-muted/50">
                  <td className="p-4 font-semibold">Specifications</td>
                  {products.map(product => <td key={product.id} className="p-4"></td>)}
                </tr>

                {/* Dynamic spec rows based on available specs */}
                {Object.keys(products[0]?.specifications || {}).map(specKey => {
                const specLabel = specKey.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                return <tr key={specKey} className="border-b">
                        <td className="p-4 text-muted-foreground">
                          {specLabel}
                        </td>
                        {products.map(product => {
                    const value = product.specifications[specKey];
                    if (typeof value === "object" && value !== null) {
                      return <td key={product.id} className="p-4">
                                <div className="space-y-1">
                                  {Object.entries(value).map(([subKey, subValue]) => <div key={subKey} className="text-sm">
                                        <span className="text-muted-foreground">
                                          {subKey}:{" "}
                                        </span>
                                        <span>
                                          {Array.isArray(subValue) ? subValue.join(", ") : String(subValue)}
                                        </span>
                                      </div>)}
                                </div>
                              </td>;
                    }
                    return <td key={product.id} className="p-4">
                              {Array.isArray(value) ? value.join(", ") : String(value || "N/A")}
                            </td>;
                  })}
                      </tr>;
              })}

                {/* Actions */}
                <tr className="border-b bg-muted/50">
                  <td className="p-4 font-semibold">Actions</td>
                  {products.map(product => <td key={product.id} className="p-4">
                      <div className="space-y-2">
                        <Link href={`/products/${product.specifications.brand?.toLowerCase()}/${product.id}`}>
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          Add to Cart
                        </Button>
                      </div>
                    </td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>;
}