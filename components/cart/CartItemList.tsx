import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";

interface CartItemListProps {
  products: (Product & { quantity: number })[];
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export function CartItemList({
  products,
  updateQuantity,
  removeItem,
  clearCart,
}: CartItemListProps) {
  return (
    <div className="space-y-4">
      {products.map((p) => (
        <CartItem
          key={p.id}
          product={p}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      ))}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={clearCart}
          className="text-destructive bg-transparent"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cart
        </Button>
      </div>
    </div>
  );
}
