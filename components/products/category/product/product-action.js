import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Share2 } from "lucide-react";
export function ProductActions({
  inStock
}) {
  return <div className="flex flex-col sm:flex-row gap-3">
      <Button size="lg" className="flex-1" disabled={!inStock}>
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
      <Button variant="outline" size="lg">
        <Heart className="w-4 h-4 mr-2" />
        Wishlist
      </Button>
      <Button variant="outline" size="lg">
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>;
}