/**
 * app/Store.jsx (was Store.jsx)
 * Solex — Redux Store
 *
 * Added: payment + checkout reducers
 * Existing cart reducer untouched.
 */

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/CartSlice";
import paymentReducer from "../features/payment/paymentSlice";
import checkoutReducer from "../features/payment/checkoutSlice"

const store = configureStore({
  reducer: {
    cart: cartReducer,
    payment: paymentReducer,
    checkout: checkoutReducer,
  },
});

export default store;
