"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { CartBreadcrumb } from "@/components/cart/CartBreadcrumb";
import { CartHeader } from "@/components/cart/CartHeader";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartLoadingState } from "@/components/cart/CartLoadingState";
import { CartItemList } from "@/components/cart/CartItemList";
import { OrderSummary } from "@/components/cart/OrderSummary";
export function CartPageContent() {
  const {
    items,
    totalItems,
    updateQuantity,
    removeItem,
    clearCart,
    getCartProducts
  } = useCart();
  const [cartProducts, setCartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadCartProducts = async () => {
      setIsLoading(true);
      try {
        const products = await getCartProducts();
        setCartProducts(products);
      } finally {
        setIsLoading(false);
      }
    };
    loadCartProducts();
  }, [items, getCartProducts]);
  const subtotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  if (isLoading) return <CartLoadingState />;
  if (totalItems === 0) return <CartEmptyState />;
  return <div className="container mx-auto px-4 py-8">
      <CartBreadcrumb />
      <CartHeader totalItems={totalItems} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItemList products={cartProducts} updateQuantity={updateQuantity} removeItem={removeItem} clearCart={clearCart} />
        </div>
        <div className="lg:col-span-1">
          <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} totalItems={totalItems} />
        </div>
      </div>
    </div>;
}