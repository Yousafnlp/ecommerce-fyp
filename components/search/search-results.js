"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux";
import { addCartItemAsync } from "@/store/slices/cartSlice";
import { Database } from "@/lib/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Grid, List, ShoppingCart, Heart, Zap, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SearchResults({ products, query, totalResults }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  const [viewMode, setViewMode] = useState("grid");
  const [wishlist, setWishlist] = useState([]);
  const sortBy = searchParams.get("sortBy") || "relevance";

  useEffect(() => {
    let active = true;
    if (!user) {
      setWishlist([]);
      return undefined;
    }

    Database.getCommerceData()
      .then((commerce) => {
        if (active) setWishlist((commerce.wishlist || []).map(String));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user]);

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "relevance") {
      params.delete("sortBy");
      params.delete("sortOrder");
    } else if (value === "price-low") {
      params.set("sortBy", "price");
      params.set("sortOrder", "asc");
    } else if (value === "price-high") {
      params.set("sortBy", "price");
      params.set("sortOrder", "desc");
    } else {
      params.set("sortBy", value);
      params.set("sortOrder", "desc");
    }

    router.push(`/search?${params.toString()}`);
  };

  const selectedSortValue =
    sortBy === "price"
      ? searchParams.get("sortOrder") === "asc"
        ? "price-low"
        : "price-high"
      : sortBy;

  const handleWishlist = async (productId) => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    try {
      const nextWishlist = await Database.toggleWishlist(productId);
      setWishlist((nextWishlist || []).map(String));
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const ProductCard = ({ product, compact = false }) => {
    const liked = wishlist.includes(String(product.id));

    if (compact) {
      return (
        <Card key={product.id} className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-muted shrink-0">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {product.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.brand}
                      </Badge>
                      <Badge className="bg-primary text-xs">
                        Score: {product.score}
                      </Badge>
                    </div>
                    <h3 className="mb-1 text-xl font-semibold">{product.name}</h3>
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${product.price}</div>
                    {product.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs ${
                      product.inStock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/products/${product.category}/${product.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!product.inStock}
                    onClick={() =>
                      dispatch(addCartItemAsync({ productId: product.id, quantity: 1 }))
                    }
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant={liked ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleWishlist(product.id)}
                  >
                    <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
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
      );
    }

    return (
      <Card
        key={product.id}
        className="group transition-all duration-300 hover:shadow-lg"
      >
        <CardHeader className="p-4">
          <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <Badge className="absolute top-2 right-2 bg-primary">
              Score: {product.score}
            </Badge>
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
            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {product.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
            <div
              className={`rounded-full px-2 py-1 text-xs ${
                product.inStock
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">${product.price}</div>
              {product.originalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice}
                </div>
              )}
            </div>
            <Button
              variant={liked ? "default" : "ghost"}
              size="sm"
              onClick={() => handleWishlist(product.id)}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Link href={`/products/${product.category}/${product.id}`} className="flex-1">
              <Button className="w-full" size="sm">
                View Details
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              disabled={!product.inStock}
              className="px-3 bg-transparent"
              onClick={() =>
                dispatch(addCartItemAsync({ productId: product.id, quantity: 1 }))
              }
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (totalResults === 0 && query) {
    return (
      <div className="space-y-6">
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No results found</h3>
          <p className="mb-6 text-muted-foreground">
            We couldn&apos;t find any products matching &quot;{query}&quot;.
          </p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
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
              NLP-powered search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Smart Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Category-aware product scores
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Natural Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Search with plain language and filters
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
          <Select value={selectedSortValue} onValueChange={handleSortChange}>
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
          <div className="flex rounded-lg border">
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

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      )}
    </div>
  );
}
