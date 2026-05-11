/**
 * features/checkout/checkoutSlice.js
 * Solex — Checkout Redux Slice
 *
 * Manages address form data and coupon so
 * CheckoutPage and PaymentPage can share state
 * without localStorage gymnastics.
 */

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shippingAddress: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  },
  deliveryMethod: "standard", // "standard" | "express"
  paymentMethod: "razorpay",  // "razorpay" | "cod"
  couponCode: "",
  couponApplied: false,
  couponDiscount: 0,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,

  reducers: {
    setShippingAddress: (state, action) => {
      state.shippingAddress = { ...state.shippingAddress, ...action.payload };
    },

    setDeliveryMethod: (state, action) => {
      state.deliveryMethod = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    setCouponCode: (state, action) => {
      state.couponCode = action.payload;
    },

    applyCoupon: (state, action) => {
      state.couponApplied = true;
      state.couponDiscount = action.payload; // discount amount in ₹
    },

    removeCoupon: (state) => {
      state.couponCode = "";
      state.couponApplied = false;
      state.couponDiscount = 0;
    },

    resetCheckout: () => initialState,
  },
});

export const {
  setShippingAddress,
  setDeliveryMethod,
  setPaymentMethod,
  setCouponCode,
  applyCoupon,
  removeCoupon,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;