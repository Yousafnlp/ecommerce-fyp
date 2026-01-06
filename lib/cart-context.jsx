"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Database } from "./database";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("specsmart_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("specsmart_cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("specsmart_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (productId, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productId);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { productId, quantity, addedAt: new Date() }];
      }
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartProducts = async () => {
    const productIds = items.map((item) => item.productId);
    const products = await Database.getProductsByIds(productIds);
    return products.map((product) => {
      const cartItem = items.find((item) => item.productId === product.id);
      return { ...product, quantity: cartItem?.quantity || 0 };
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // For simplicity, we'll calculate total price synchronously using a mock
  const totalPrice = items.reduce((sum, item) => {
    // Mock price calculation - in real app, you'd fetch product prices
    return sum + item.quantity * 500; // Assuming average price of $500
  }, 0);

  const value = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartProducts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
