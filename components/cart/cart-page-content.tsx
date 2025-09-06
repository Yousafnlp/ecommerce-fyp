"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

export function CartPageContent() {
  const {
    items,
    totalItems,
    updateQuantity,
    removeItem,
    clearCart,
    getCartProducts,
  } = useCart();
  const [cartProducts, setCartProducts] = useState<
    (Product & { quantity: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCartProducts = async () => {
      setIsLoading(true);
      try {
        const products = await getCartProducts();
        setCartProducts(products);
      } catch (error) {
        console.error("Failed to load cart products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartProducts();
  }, [items, getCartProducts]);

  const subtotal = cartProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link href="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {product.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {product.brand}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                          <Badge className="bg-primary text-xs">
                            Score: {product.score}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateQuantity(product.id, product.quantity - 1)
                            }
                            disabled={product.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={product.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                product.id,
                                Number.parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 h-8 text-center border-0 focus-visible:ring-0"
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateQuantity(product.id, product.quantity + 1)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ${product.price} each
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${(product.price * product.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Clear Cart */}
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

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
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
                <span>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
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

              {shipping > 0 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  Add ${(100 - subtotal).toFixed(2)} more to get free shipping!
                </div>
              )}

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
          </Card>
        </div>
      </div>
    </div>
  );
}
