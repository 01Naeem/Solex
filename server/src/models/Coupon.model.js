/**
 * models/Coupon.js
 * Solex — Coupon Model
 *
 * Supports:
 *   - Percentage discounts
 *   - Fixed amount discounts
 *   - Usage limits
 *   - Expiry dates
 *   - Min order amount
 *   - Max discount cap
 */

import mongoose from "mongoose";

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    // Coupon code (ex: SOLEX50)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // percent OR fixed
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },

    // 10 => 10% OR ₹10
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },

    // For percent coupons only
    // Example: 20% OFF up to ₹500
    maxDiscount: {
      type: Number,
      default: null,
    },

    // Minimum cart value required
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    // Total allowed uses
    usageLimit: {
      type: Number,
      default: null,
    },

    // Current usage count
    usedCount: {
      type: Number,
      default: 0,
    },

    // Expiration date
    expiresAt: {
      type: Date,
      default: null,
    },

    // Enable / disable coupon
    isActive: {
      type: Boolean,
      default: true,
    },

    // Optional admin description
    description: {
      type: String,
      trim: true,
    },

    // Optional: user-specific coupon
    assignedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────
couponSchema.index({
  code: 1,
  isActive: 1,
});

// ─────────────────────────────────────────────────────────────
// Virtual: isExpired
// ─────────────────────────────────────────────────────────────
couponSchema.virtual(
  "isExpired"
).get(function () {
  return (
    this.expiresAt &&
    this.expiresAt < new Date()
  );
});

// ─────────────────────────────────────────────────────────────
// Prevent over-usage
// ─────────────────────────────────────────────────────────────
couponSchema.methods.canBeUsed =
  function () {
    if (!this.isActive) {
      return false;
    }

    if (
      this.expiresAt &&
      this.expiresAt < new Date()
    ) {
      return false;
    }

    if (
      this.usageLimit &&
      this.usedCount >=
        this.usageLimit
    ) {
      return false;
    }

    return true;
  };

const Coupon = mongoose.model(
  "Coupon",
  couponSchema
);

export default Coupon;