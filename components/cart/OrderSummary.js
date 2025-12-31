import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export function OrderSummary({
  subtotal,
  shipping,
  tax,
  total,
  totalItems
}) {
  return <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal ({totalItems} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {shipping > 0 && <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            Add ${(100 - subtotal).toFixed(2)} more to get free shipping!
          </div>}

        <Link href="/checkout">
          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Link>

        <div className="text-center">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>;
}