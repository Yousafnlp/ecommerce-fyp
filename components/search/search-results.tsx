"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Grid,
  List,
  ShoppingCart,
  Heart,
  Zap,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

interface SearchResultsProps {
  products: Product[];
  query: string;
  totalResults: number;
}

export function SearchResults({
  products,
  query,
  totalResults,
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");

  if (totalResults === 0 && query) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6">
            We couldn't find any products matching "{query}". Try adjusting your
            search or filters.
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Search suggestions:</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">Check spelling</Badge>
                <Badge variant="outline">Use fewer keywords</Badge>
                <Badge variant="outline">Try broader terms</Badge>
              </div>
            </div>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Start Your Search</CardTitle>
            <CardDescription>
              Use the search interface on the left to find products with our
              advanced AI-powered search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Smart Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered product scores
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Voice Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Search by speaking naturally
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {query ? `Search results for "${query}"` : "Search Results"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalResults} product{totalResults !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Options */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="score">SpecSmart Score</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Badge className="absolute top-2 right-2 bg-primary">
                    Score: {product.score}
                  </Badge>
                  {product.originalPrice && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 left-2"
                    >
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
                    <span className="text-sm font-medium">
                      {product.rating}
                    </span>
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
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {product.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {product.brand}
                          </Badge>
                          <Badge className="bg-primary text-xs">
                            Score: {product.score}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-1">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${product.price}
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {product.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount} reviews)
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

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product.category}/${product.id}`}
                      >
                        <Button size="sm">View Details</Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Link href={`/compare?products=${product.id}`}>
                        <Button variant="outline" size="sm">
                          Compare
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {products.length > 0 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
}
