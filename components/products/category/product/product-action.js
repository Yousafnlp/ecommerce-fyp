import { Button } from "@/components/ui/button";
import { addItem } from "@/store/slices/cartSlice";
import { Heart, ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
export function ProductActions({ inStock, product }) {
  const dispatch = useDispatch();
  const handleAddToCart = () => {
    if (!inStock) return;

    dispatch(
      addItem({
        ...product,
        productId: product.id,
        quantity: 1,
      })
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        size="lg"
        className="flex-1"
        disabled={!inStock}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
      <Button variant="outline" size="lg">
        <Heart className="w-4 h-4 mr-2" />
        Wishlist
      </Button>
    </div>
  );
}
