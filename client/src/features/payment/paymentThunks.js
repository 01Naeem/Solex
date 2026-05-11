/**
 * features/payment/paymentThunks.js
 * Solex — Payment Async Thunks
 *
 * Uses your existing `api` axios instance from src/services/api.js
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api.js";

/**
 * ════════════════════════════════════════
 * CREATE RAZORPAY ORDER
 * ════════════════════════════════════════
 * Sends cart + shipping address to backend.
 * Backend validates stock, recalculates total,
 * creates Razorpay order and returns order ID.
 */
export const createRazorpayOrder = createAsyncThunk(
  "payment/createOrder",
  async ({ cartItems, shippingAddress, couponCode }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/payments/create-order", {
        cartItems,
        shippingAddress,
        couponCode: couponCode || null,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create order. Try again.",
      );
    }
  },
);

/**
 * ════════════════════════════════════════
 * VERIFY RAZORPAY PAYMENT
 * ════════════════════════════════════════
 * Called inside Razorpay modal handler callback.
 * Sends the 3 Razorpay response fields to backend
 * for HMAC signature verification.
 */
export const verifyRazorpayPayment = createAsyncThunk(
  "payment/verify",
  async (
    { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/payments/verify", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
      });
      return data.data; // { orderId }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Payment verification failed.",
      );
    }
  },
);

/**
 * ════════════════════════════════════════
 * RETRY FAILED PAYMENT
 * ════════════════════════════════════════
 * Creates a new Razorpay order for a failed payment.
 * Backend reuses the existing DB order, just
 * gets a fresh Razorpay order ID.
 */
export const retryPayment = createAsyncThunk(
  "payment/retry",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/payments/retry/${orderId}`);
      return data.data; // { razorpayOrderId, amount }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not retry payment.",
      );
    }
  },
);
