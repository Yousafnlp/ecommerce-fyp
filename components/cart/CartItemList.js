import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
export function CartItemList({
  products,
  updateQuantity,
  removeItem,
  clearCart
}) {
  return <div className="space-y-4">
      {products.map(p => <CartItem key={p.id} product={p} updateQuantity={updateQuantity} removeItem={removeItem} />)}
      <div className="flex justify-end">
        <Button variant="outline" onClick={clearCart} className="text-destructive bg-transparent">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cart
        </Button>
      </div>
    </div>;
}