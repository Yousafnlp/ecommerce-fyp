"use client";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  selectCartItems,
  selectTotalItems,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
} from "@/store/slices/cartSlice";
import { Database } from "./database";

export function CartProvider({ children }) {
  // No-op provider kept for compatibility with previous imports
  return children;
}

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);

  const getCartProducts = async () => {
    const productIds = items.map((it) => it.productId);
    const products = await Database.getProductsByIds(productIds);
    return products.map((product) => {
      const cartItem = items.find((i) => i.productId === product.id);
      return { ...product, quantity: cartItem?.quantity || 0 };
    });
  };

  return {
    items,
    totalItems,
    addItem: (productId, quantity = 1) =>
      dispatch(addItem({ productId, quantity })),
    removeItem: (productId) => dispatch(removeItem(productId)),
    updateQuantity: (productId, quantity) =>
      dispatch(updateQuantity({ productId, quantity })),
    clearCart: () => dispatch(clearCart()),
    getCartProducts,
  };
}
