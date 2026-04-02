"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux";
import {
  selectCartItems,
  selectTotalItems,
  setCart,
  updateCartQuantityAsync,
  removeCartItemAsync,
  clearCartAsync,
} from "@/store/slices/cartSlice";
import { Database } from "@/lib/database";
import { CartBreadcrumb } from "@/components/cart/CartBreadcrumb";
import { CartHeader } from "@/components/cart/CartHeader";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartLoadingState } from "@/components/cart/CartLoadingState";
import { CartItemList } from "@/components/cart/CartItemList";
import { OrderSummary } from "@/components/cart/OrderSummary";
export function CartPageContent() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);
  const [cartProducts, setCartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCartProducts = async () => {
      setIsLoading(true);
      try {
        if (items.length === 0) {
          const commerce = await Database.getCommerceData();
          if (commerce.cart?.length) {
            dispatch(setCart(commerce.cart));
            return;
          }
          setCartProducts([]);
        } else {
          const productIds = items.map((it) => it.productId).filter(Boolean);
          const products = await Database.getProductsByIds(productIds);
          const enriched = products.map((product) => {
            const cartItem = items.find((i) => i.productId === product.id);
            return { ...product, quantity: cartItem?.quantity || 0 };
          });
          setCartProducts(enriched);
        }
      } catch (err) {
        console.error("Failed to load cart products:", err);
        setCartProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartProducts();
  }, [dispatch, items]);
  const subtotal = cartProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  if (isLoading) return <CartLoadingState />;
  if (totalItems === 0) return <CartEmptyState />;
  return (
    <div className="container mx-auto px-4 py-8">
      <CartBreadcrumb />
      <CartHeader totalItems={totalItems} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItemList
            products={cartProducts}
            updateQuantity={(productId, q) =>
              dispatch(updateCartQuantityAsync({ productId, quantity: q }))
            }
            removeItem={(id) => dispatch(removeCartItemAsync(id))}
            clearCart={() => dispatch(clearCartAsync())}
          />
        </div>
        <div className="lg:col-span-1">
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            totalItems={totalItems}
          />
        </div>
      </div>
    </div>
  );
}
