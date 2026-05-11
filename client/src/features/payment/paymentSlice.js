/**
 * features/payment/paymentSlice.js
 * Solex — Payment Redux Slice
 *
 * Manages:
 *   - Razorpay order creation state
 *   - Payment verification state
 *   - Retry payment state
 *   - Error / loading states
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  retryPayment,
} from "./paymentThunks";

const initialState = {
  // Order creation
  razorpayOrderId: null,
  orderId: null,
  amount: null,
  breakdown: null,
  isCreatingOrder: false,
  createOrderError: null,

  // Payment verification
  isVerifying: false,
  isVerified: false,
  verifyError: null,

  // Retry
  isRetrying: false,
  retryError: null,

  // Current order ID for success/failed pages
  currentOrderId: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,

  reducers: {
    /**
     * Called when user dismisses Razorpay modal without paying
     */
    resetPayment: () => initialState,

    /**
     * Store the final orderId after successful verification
     */
    setCurrentOrderId: (state, action) => {
      state.currentOrderId = action.payload;
    },

    clearPaymentError: (state) => {
      state.createOrderError = null;
      state.verifyError = null;
      state.retryError = null;
    },
  },

  extraReducers: (builder) => {
    // ── Create Razorpay Order ──────────────────────────────────────────────
    builder
      .addCase(createRazorpayOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.createOrderError = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.isCreatingOrder = false;
        state.razorpayOrderId = action.payload.razorpayOrderId;
        state.orderId = action.payload.orderId;
        state.amount = action.payload.amount;
        state.breakdown = action.payload.breakdown;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.createOrderError = action.payload;
      });

    // ── Verify Payment ────────────────────────────────────────────────────
    builder
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.isVerifying = true;
        state.verifyError = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.isVerified = true;
        state.currentOrderId = action.payload.orderId;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.isVerifying = false;
        state.verifyError = action.payload;
      });

    // ── Retry Payment ─────────────────────────────────────────────────────
    builder
      .addCase(retryPayment.pending, (state) => {
        state.isRetrying = true;
        state.retryError = null;
      })
      .addCase(retryPayment.fulfilled, (state, action) => {
        state.isRetrying = false;
        state.razorpayOrderId = action.payload.razorpayOrderId;
        state.amount = action.payload.amount;
      })
      .addCase(retryPayment.rejected, (state, action) => {
        state.isRetrying = false;
        state.retryError = action.payload;
      });
  },
});

export const { resetPayment, setCurrentOrderId, clearPaymentError } =
  paymentSlice.actions;

export default paymentSlice.reducer;