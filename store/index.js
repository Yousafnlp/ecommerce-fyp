import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cart-slice";
import authReducer from "./slices/auth-slice";
import productsReducer from "./slices/products-slice";
import compareReducer from "./slices/compare-slice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    products: productsReducer,
    compare: compareReducer,
  },
});

export default store;
