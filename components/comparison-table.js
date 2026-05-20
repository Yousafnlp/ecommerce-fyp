"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Star, ShoppingCart, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/lib/redux";
import { addCartItemAsync } from "@/store/slices/cartSlice";

function getBestIndex(products, getter, mode = "max") {
  const values = products.map((p) => {
    const v = getter(p);
    return typeof v === "number" ? v : parseFloat(v) || null;
  });
  const valid = values.filter((v) => v !== null);
  if (valid.length === 0) return -1;
  const best = mode === "max" ? Math.max(...valid) : Math.min(...valid);
  return values.findIndex((v) => v === best);
}

function CellHighlight({ isBest, children }) {
  return (
    <td
      className={`p-4 transition-colors ${
        isBest ? "bg-green-50 dark:bg-green-950/30" : ""
      }`}
    >
      {isBest ? (
        <span className="flex items-center gap-1">
          {children}
          <Trophy className="w-3 h-3 text-green-600 shrink-0" />
        </span>
      ) : (
        children
      )}
    </td>
  );
}

function renderSpecValue(value) {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="text-muted-foreground capitalize">
              {k.replace(/([A-Z])/g, " $1")}:{" "}
            </span>
            <span>{Array.isArray(v) ? v.join(", ") : String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function ComparisonTable({ products }) {
  const dispatch = useAppDispatch();
  const maxProducts = 4;
  const canAddMore = products.length < maxProducts;

  const removeProduct = (productId) => {
    const remaining = products
      .filter((p) => p.id !== productId)
      .map((p) => p.id);
    const newUrl =
      remaining.length > 0
        ? `/compare?products=${remaining.join(",")}`
        : "/compare";
    window.location.href = newUrl;
  };

  const handleAddToCart = (productId) => {
    dispatch(addCartItemAsync({ productId, quantity: 1 }));
  };

  const bestPriceIdx = getBestIndex(products, (p) => p.price, "min");
  const bestScoreIdx = getBestIndex(products, (p) => p.score, "max");
  const bestRatingIdx = getBestIndex(products, (p) => p.rating, "max");

  const allSpecKeys = Array.from(
    products.reduce((keys, p) => {
      Object.keys(p.specifications || {}).forEach((k) => keys.add(k));
      return keys;
    }, new Set())
  );

  return (
    <div className="space-y-6">
      {/* Product Header Cards */}
      <div className="font-semibold text-lg self-center">Products</div>
      <div
        className="grid gap-4 grid-cols-2"
        // style={{
        //   gridTemplateColumns: `200px repeat(${products.length}, 1fr)`,
        // }}
      >
        {products.map((product, idx) => (
          <Card
            key={product.id}
            className={idx === bestScoreIdx ? "ring-2 ring-primary" : ""}
          >
            <CardHeader className="p-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground z-10"
                  onClick={() => removeProduct(product.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
                {idx === bestScoreIdx && (
                  <Badge className="absolute -top-2 left-2 bg-primary text-xs gap-1 z-10">
                    <Trophy className="w-3 h-3" /> Best Score
                  </Badge>
                )}
                <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-muted mt-2">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-base line-clamp-2 mb-1">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-2">
                  {product.brand}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <Badge
                    className={
                      idx === bestScoreIdx ? "bg-primary" : "bg-secondary text-secondary-foreground"
                    }
                  >
                    Score: {product.score}
                  </Badge>
                  <div className="text-lg font-bold">${product.price}</div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {canAddMore && (
          <Card className="border-dashed">
            <CardContent className="p-4 flex items-center justify-center h-full min-h-50">
              <Link href="/products">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {/* Section: Basic Info */}
                <tr className="border-b bg-muted/50">
                  <td className="p-4 font-semibold w-48" colSpan={products.length + 1}>
                    Basic Information
                  </td>
                </tr>

                {/* Price */}
                <tr className="border-b">
                  <td className="p-4 text-muted-foreground font-medium">Price</td>
                  {products.map((product, idx) => (
                    <CellHighlight key={product.id} isBest={idx === bestPriceIdx}>
                      <span className="font-semibold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${product.originalPrice}
                        </span>
                      )}
                    </CellHighlight>
                  ))}
                </tr>

                {/* SpecSmart Score */}
                <tr className="border-b">
                  <td className="p-4 text-muted-foreground font-medium">
                    SpecSmart Score
                  </td>
                  {products.map((product, idx) => (
                    <CellHighlight key={product.id} isBest={idx === bestScoreIdx}>
                      <Badge
                        className={
                          idx === bestScoreIdx
                            ? "bg-primary"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {product.score}/100
                      </Badge>
                    </CellHighlight>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b">
                  <td className="p-4 text-muted-foreground font-medium">Rating</td>
                  {products.map((product, idx) => (
                    <CellHighlight key={product.id} isBest={idx === bestRatingIdx}>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </span>
                    </CellHighlight>
                  ))}
                </tr>

                {/* Brand */}
                <tr className="border-b">
                  <td className="p-4 text-muted-foreground font-medium">Brand</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      {product.brand}
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr className="border-b">
                  <td className="p-4 text-muted-foreground font-medium">
                    Availability
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Section: Specifications */}
                <tr className="border-b bg-muted/50">
                  <td className="p-4 font-semibold" colSpan={products.length + 1}>
                    Specifications
                  </td>
                </tr>

                {allSpecKeys.map((specKey) => {
                  const label = specKey
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase());
                  return (
                    <tr key={specKey} className="border-b">
                      <td className="p-4 text-muted-foreground font-medium align-top">
                        {label}
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 align-top">
                          {renderSpecValue(product.specifications?.[specKey])}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {/* Section: Key Features */}
                {products.some((p) => p.features?.length > 0) && (
                  <>
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-semibold" colSpan={products.length + 1}>
                        Key Features
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-muted-foreground font-medium align-top">
                        Features
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 align-top">
                          {product.features?.length > 0 ? (
                            <ul className="space-y-1 list-disc list-inside">
                              {product.features.map((f, i) => (
                                <li key={i} className="text-sm">
                                  {f}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* Section: Actions */}
                <tr className="bg-muted/50">
                  <td className="p-4 font-semibold">Actions</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="space-y-2">
                        <Link
                          href={`/products/${product.category}/${product.id}`}
                          className="block"
                        >
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 bg-transparent"
                          disabled={!product.inStock}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
