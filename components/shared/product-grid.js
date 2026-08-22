"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { Database } from "@/lib/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/shared/product-card";

export function ProductGrid({ products }) {
  const user = useAppSelector((state) => state.auth.user);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    let active = true;
    if (!user) {
      setWishlistIds(new Set());
      return undefined;
    }

    Database.getCommerceData()
      .then((commerce) => {
        if (active) {
          setWishlistIds(new Set((commerce.wishlist || []).map(String)));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user]);

  const handleToggleWishlist = async (productId) => {
    const next = new Set(wishlistIds);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    setWishlistIds(next);

    try {
      const wishlist = await Database.toggleWishlist(productId);
      setWishlistIds(new Set((wishlist || []).map(String)));
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          liked={wishlistIds.has(String(product.id))}
          onToggleWishlist={handleToggleWishlist}
        />
      ))}
    </div>
  );
}
