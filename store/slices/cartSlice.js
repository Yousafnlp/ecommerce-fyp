import { createSlice } from "@reduxjs/toolkit";

// initialize from localStorage if available (keeps parity with previous context)
const loadInitial = () => {
  try {
    const raw =
      typeof window !== "undefined" &&
      window.localStorage.getItem("specsmart_cart");
    if (!raw) return { items: [], totalQuantity: 0 };
    const items = JSON.parse(raw);
    const totalQuantity = items.reduce((s, i) => s + (i.quantity || 0), 0);
    return { items, totalQuantity };
  } catch {
    return { items: [], totalQuantity: 0 };
  }
};

const initialState = loadInitial();
console.log({initialState})
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action) {
      const item = action.payload; // expected { productId, quantity }
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }
      state.totalQuantity = state.items.reduce(
        (s, i) => s + (i.quantity || 0),
        0
      );
      try {
        window.localStorage.setItem(
          "specsmart_cart",
          JSON.stringify(state.items)
        );
      } catch {}
    },
    removeItem(state, action) {
      const productId = action.payload;
      state.items = state.items.filter((i) => i.productId !== productId);
      state.totalQuantity = state.items.reduce(
        (s, i) => s + (i.quantity || 0),
        0
      );
      try {
        window.localStorage.setItem(
          "specsmart_cart",
          JSON.stringify(state.items)
        );
      } catch {}
    },
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) existing.quantity = quantity;
      state.items = state.items.filter((i) => i.quantity > 0);
      state.totalQuantity = state.items.reduce(
        (s, i) => s + (i.quantity || 0),
        0
      );
      try {
        window.localStorage.setItem(
          "specsmart_cart",
          JSON.stringify(state.items)
        );
      } catch {}
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      try {
        window.localStorage.removeItem("specsmart_cart");
      } catch {}
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } =
  cartSlice.actions;
export const selectCartItems = (state) => state.cart.items;
export const selectTotalItems = (state) => state.cart.totalQuantity;
export default cartSlice.reducer;
