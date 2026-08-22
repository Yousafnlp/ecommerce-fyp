"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addCartItemAsync } from "@/store/slices/cart-slice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, GitCompare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCompare } from "@/store/hooks";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product, liked = false, onToggleWishlist, index = 0 }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { removeFromCompare, isInCompare, canAddProduct, tryAddToCompare } =
    useCompare();

  const detailHref = `/products/${product.category}/${product.id}`;
  const inCompare = isInCompare(product.id);
  const compareCheck = canAddProduct(product);

  const handleWishlistClick = () => {
    if (!user) {
      router.push("/signin");
      return;
    }
    onToggleWishlist?.(product.id);
  };

  return (
    <Card
      className="group transition-all duration-300 hover:shadow-[var(--shadow-lift)] hover:border-ring/30 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardHeader className="p-4">
        <Link
          href={detailHref}
          aria-label={`View details for ${product.name}`}
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <div className="aspect-square relative mb-4 overflow-hidden rounded-xl bg-muted/60">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <Badge variant="brand" className="absolute top-2 right-2">
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
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {product.description}
            </CardDescription>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[var(--color-star)] text-[var(--color-star)]" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
          <div
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              product.inStock
                ? "bg-success/10 text-success border-success/20"
                : "bg-danger/10 text-danger border-danger/20"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{formatPrice(product.price)}</div>
            {product.originalPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>
          <Button
            variant={liked ? "default" : "ghost"}
            size="sm"
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={liked}
            onClick={handleWishlistClick}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="flex gap-2">
          <Link href={detailHref} className="flex-1">
            <Button className="w-full" size="sm">
              View Details
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            disabled={!product.inStock}
            className="px-3"
            aria-label="Add to cart"
            onClick={() => dispatch(addCartItemAsync({ productId: product.id, quantity: 1 }))}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button
            variant={inCompare ? "default" : "outline"}
            size="sm"
            className="px-3"
            aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
            aria-pressed={inCompare}
            disabled={!inCompare && !compareCheck.ok}
            title={
              inCompare
                ? "Remove from comparison"
                : compareCheck.ok
                ? "Add to comparison"
                : compareCheck.message
            }
            onClick={() =>
              inCompare ? removeFromCompare(product.id) : tryAddToCompare(product)
            }
          >
            <GitCompare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
