import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";

function persistItems(items) {
  try {
    if (!items.length) {
      window.localStorage.removeItem("specsmart_cart");
      return;
    }
    window.localStorage.setItem("specsmart_cart", JSON.stringify(items));
  } catch {}
}

function normalizeItems(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item?.productId)
    .map((item) => ({
      productId: String(item.productId),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));
}

function totalQuantity(items) {
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

const loadInitial = () => {
  try {
    const raw =
      typeof window !== "undefined" &&
      window.localStorage.getItem("specsmart_cart");
    const items = raw ? normalizeItems(JSON.parse(raw)) : [];
    return { items, totalQuantity: totalQuantity(items), isSyncing: false };
  } catch {
    return { items: [], totalQuantity: 0, isSyncing: false };
  }
};

export const syncCart = createAsyncThunk(
  "cart/sync",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const user = state.auth?.user;
    const localItems = normalizeItems(state.cart?.items);

    if (!user) {
      return localItems;
    }

    try {
      const commerce = await apiClient.getCommerce();
      const serverItems = normalizeItems(commerce.cart);

      const merged = [...serverItems];
      for (const localItem of localItems) {
        const existing = merged.find(
          (item) => item.productId === localItem.productId
        );
        if (existing) {
          existing.quantity = Math.max(existing.quantity, localItem.quantity);
        } else {
          merged.push(localItem);
        }
      }

      if (JSON.stringify(merged) !== JSON.stringify(serverItems)) {
        for (const item of merged) {
          await apiClient.addCartItem({
            productId: item.productId,
            quantity: item.quantity,
          });
        }
      }

      return merged;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCartItemAsync = createAsyncThunk(
  "cart/addItemAsync",
  async ({ productId, quantity = 1 }, { getState, rejectWithValue }) => {
    const state = getState();
    const user = state.auth?.user;
    const currentItems = normalizeItems(state.cart?.items);

    if (!user) {
      const existing = currentItems.find((item) => item.productId === productId);
      if (existing) existing.quantity += quantity;
      else currentItems.push({ productId, quantity });
      return currentItems;
    }

    try {
      const existing = currentItems.find((item) => item.productId === productId);
      const nextQuantity = (existing?.quantity || 0) + quantity;
      const serverCart = await apiClient.addCartItem({
        productId,
        quantity: nextQuantity,
      });
      return normalizeItems(serverCart);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartQuantityAsync = createAsyncThunk(
  "cart/updateQuantityAsync",
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const state = getState();
    const user = state.auth?.user;
    const currentItems = normalizeItems(state.cart?.items);

    if (!user) {
      const nextItems = currentItems
        .map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0);
      return nextItems;
    }

    try {
      if (quantity <= 0) {
        const serverCart = await apiClient.removeCartItem(productId);
        return normalizeItems(serverCart);
      }
      const serverCart = await apiClient.addCartItem({
        productId,
        quantity,
      });
      return normalizeItems(serverCart);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCartItemAsync = createAsyncThunk(
  "cart/removeItemAsync",
  async (productId, { getState, rejectWithValue }) => {
    const state = getState();
    const user = state.auth?.user;
    const currentItems = normalizeItems(state.cart?.items);

    if (!user) {
      return currentItems.filter((item) => item.productId !== productId);
    }

    try {
      const serverCart = await apiClient.removeCartItem(productId);
      return normalizeItems(serverCart);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearAsync",
  async (_, { getState, rejectWithValue }) => {
    const user = getState().auth?.user;
    if (!user) return [];

    try {
      await apiClient.clearCart();
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = loadInitial();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      state.items = normalizeItems(action.payload);
      state.totalQuantity = totalQuantity(state.items);
      persistItems(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      persistItems([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCart.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.items = normalizeItems(action.payload);
        state.totalQuantity = totalQuantity(state.items);
        persistItems(state.items);
      })
      .addCase(syncCart.rejected, (state) => {
        state.isSyncing = false;
      })
      .addCase(addCartItemAsync.fulfilled, (state, action) => {
        state.items = normalizeItems(action.payload);
        state.totalQuantity = totalQuantity(state.items);
        persistItems(state.items);
      })
      .addCase(updateCartQuantityAsync.fulfilled, (state, action) => {
        state.items = normalizeItems(action.payload);
        state.totalQuantity = totalQuantity(state.items);
        persistItems(state.items);
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        state.items = normalizeItems(action.payload);
        state.totalQuantity = totalQuantity(state.items);
        persistItems(state.items);
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.totalQuantity = 0;
        persistItems([]);
      });
  },
});

export const { setCart, clearCart } = cartSlice.actions;
export const selectCartItems = (state) => state.cart.items;
export const selectTotalItems = (state) => state.cart.totalQuantity;
export default cartSlice.reducer;
