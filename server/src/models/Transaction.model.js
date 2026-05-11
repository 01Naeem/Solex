/**
 * models/Transaction.js
 * Solex — Payment Audit Log
 *
 * One record per payment attempt.
 * Used for analytics, support, and dispute resolution.
 */

import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    razorpayOrderId: {
      type: String,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      index: true,
    },

    amount: Number, // in ₹ (not paise)

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["initiated", "success", "failed", "refunded"],
      default: "initiated",
    },

    gatewayResponse: Schema.Types.Mixed, // raw Razorpay response for debugging

    ipAddress: String,
  },
  { timestamps: true },
);

export const Transaction = mongoose.model("Transaction", transactionSchema);

/**
 * models/WebhookEvent.js
 * Solex — Razorpay Webhook Idempotency Store
 *
 * Prevents the same webhook event from being
 * processed twice (payment.captured + verify both running).
 */

const webhookEventSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    event: String,

    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

// Auto-delete webhook records after 30 days (TTL index)
webhookEventSchema.index(
  { processedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 },
);

export const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);
