import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export function CartEmptyState() {
  return <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">
        Looks like you haven&apos;t added any products yet.
      </p>
      <Link href="/products">
        <Button size="lg">Start Shopping</Button>
      </Link>
    </div>;
}