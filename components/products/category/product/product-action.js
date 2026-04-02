"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux";
import { addCartItemAsync } from "@/store/slices/cartSlice";
import { Database } from "@/lib/database";
import { ShoppingCart, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export function ProductActions({
  product
}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const [wishlist, setWishlist] = useState(user?.wishlist || []);
  const [isSaving, setIsSaving] = useState(false);
  const inStock = product?.inStock;

  useEffect(() => {
    setWishlist(user?.wishlist || []);
  }, [user]);

  const handleAddToCart = async () => {
    dispatch(addCartItemAsync({ productId: product.id, quantity: 1 }));
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setIsSaving(true);
    try {
      const nextWishlist = await Database.toggleWishlist(product.id);
      setWishlist(nextWishlist);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  };

  const isLiked = wishlist.includes(product.id);

  return <div className="flex flex-col sm:flex-row gap-3">
      <Button size="lg" className="flex-1" disabled={!inStock} onClick={handleAddToCart}>
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
      <Button variant={isLiked ? "default" : "outline"} size="lg" onClick={handleWishlistToggle} disabled={isSaving}>
        <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current text-red-500" : ""}`} />
        {isLiked ? "Liked" : "Like"}
      </Button>
      <Button variant="outline" size="lg" onClick={handleShare}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>;
}
