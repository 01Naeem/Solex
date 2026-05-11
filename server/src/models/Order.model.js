/**
 * models/Order.js
 * Solex — Order + Payment Schema
 *
 * Add these fields to your existing Order model,
 * or use this as a base if you don't have one yet.
 */

import mongoose from "mongoose";
const { Schema } = mongoose;

// ─── Embedded order item ──────────────────────────────────────────────────────
const orderItemSchema = new Schema(
  {
    product:        { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name:           String,
    image:          String,
    selectedSize:   { type: String, required: true },
    selectedColor:  { type: String, default: "Default" },
    quantity:       { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true }, // locked price at time of order
  },
  { _id: false }
);

// ─── Main order schema ────────────────────────────────────────────────────────
const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      line1:    { type: String, required: true },
      line2:    String,
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      country:  { type: String, default: "IN" },
    },

    // ── Pricing breakdown ──────────────────────────────────────────────────
    subtotal:     { type: Number, required: true },
    discount:     { type: Number, default: 0 },
    shippingFee:  { type: Number, default: 0 },
    platformFee:  { type: Number, default: 29 },
    tax:          { type: Number, default: 0 },   // GST 18%
    totalAmount:  { type: Number, required: true },

    // ── Payment ────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded", "cancelled"],
      default: "pending",
      index: true,
    },

    // ── Razorpay IDs ───────────────────────────────────────────────────────
    razorpayOrderId:   { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: String,

    // ── Order lifecycle ────────────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: [
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "processing",
      index: true,
    },

    // ── Invoice & Coupon ───────────────────────────────────────────────────
    invoiceId:  { type: String, unique: true, sparse: true },
    coupon:     { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponCode: String,

    // ── Audit trail ────────────────────────────────────────────────────────
    statusHistory: [
      {
        status:    String,
        note:      String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ─── Compound indexes ─────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;