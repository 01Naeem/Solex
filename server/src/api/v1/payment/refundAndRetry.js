/**
 * controllers/payment/refundAndRetry.js
 * Solex — Refund + Retry Payment Controllers
 */

import mongoose from "mongoose";

import razorpay from "../../../config/razorpay.js";

import Order from "../../../models/Order.model.js";

// ─────────────────────────────────────────────────────────────
// RETRY PAYMENT
// Creates a fresh Razorpay order ID for a failed payment.
// Reuses the same DB Order.
// ─────────────────────────────────────────────────────────────
export const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorised",
      });
    }

    if (order.paymentStatus !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Only failed orders can be retried",
      });
    }

    // Create new Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),

      currency: "INR",

      receipt: `retry_${orderId}_${Date.now()}`,
    });

    // Update order
    order.razorpayOrderId = rzpOrder.id;

    order.paymentStatus = "pending";

    order.statusHistory.push({
      status: "pending",

      note: "Payment retry initiated",
    });

    await order.save();

    return res.status(200).json({
      success: true,

      message: "Retry order created",

      data: {
        razorpayOrderId: rzpOrder.id,

        amount: Math.round(order.totalAmount * 100),

        orderId: order._id,
      },
    });
  } catch (err) {
    console.error("[Solex] retryPayment error:", err);

    return res.status(500).json({
      success: false,
      message: "Retry failed",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// INITIATE REFUND
// Admin-only: full or partial refund
// ─────────────────────────────────────────────────────────────
export const initiateRefund = async (req, res) => {
  try {
    const { orderId } = req.params;

    const {
      amount: refundAmount,
      reason = "customer_request",
      partial = false,
    } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be refunded",
      });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: "No Razorpay payment ID found for this order",
      });
    }

    const paise = partial
      ? Math.round(refundAmount * 100)
      : Math.round(order.totalAmount * 100);

    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: paise,

      notes: {
        reason,

        orderId: orderId.toString(),

        partial: partial.toString(),
      },
    });

    const newStatus = partial ? "partially_refunded" : "refunded";

    order.paymentStatus = newStatus;

    order.statusHistory.push({
      status: newStatus,

      note: `Refund of ₹${paise / 100} initiated (ID: ${refund.id})`,
    });

    await order.save();

    return res.status(200).json({
      success: true,

      message: "Refund initiated",

      data: {
        refundId: refund.id,

        amount: paise / 100,

        status: refund.status,
      },
    });
  } catch (err) {
    console.error("[Solex] initiateRefund error:", err);

    return res.status(500).json({
      success: false,

      message: err.message || "Refund failed",
    });
  }
};
