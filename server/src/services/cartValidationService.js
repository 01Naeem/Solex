/**
 * services/cartValidationService.js
 * Solex — Server-side Cart Validator
 *
 * SECURITY:
 * Backend is the ONLY source of truth for pricing.
 * Never trust frontend totals or product prices.
 */

import mongoose from "mongoose";

import Product from "../models/Product.model.js";
import Coupon from "../models/Coupon.model.js";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const GST_RATE = 0.18;

const PLATFORM_FEE = 29;

const FREE_SHIP_THRESHOLD = 2999;

const SHIPPING_FEE = 199;

// ─────────────────────────────────────────────────────────────
// VALIDATE + PRICE CART
// ─────────────────────────────────────────────────────────────

export const validateAndPriceCart = async (
  cartItems,
  couponCode,
) => {
  // ───────────────────────────────────────────────────────────
  // 1. BASIC VALIDATION
  // ───────────────────────────────────────────────────────────

  if (
    !Array.isArray(cartItems) ||
    cartItems.length === 0
  ) {
    throw {
      status: 400,
      message: "Cart is empty",
    };
  }

  // ───────────────────────────────────────────────────────────
  // 2. FETCH PRODUCTS
  // ───────────────────────────────────────────────────────────

  const productIds = cartItems
    .map((item) => item.productId)
    .filter(Boolean)
    .map(
      (id) =>
        new mongoose.Types.ObjectId(id),
    );

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).lean();

  // ───────────────────────────────────────────────────────────
  // 3. PRODUCT MAP
  // ───────────────────────────────────────────────────────────

  const productMap = {};

  products.forEach((product) => {
    if (product?._id) {
      productMap[
        product._id.toString()
      ] = product;
    }
  });

  // ───────────────────────────────────────────────────────────
  // 4. VALIDATE ITEMS
  // ───────────────────────────────────────────────────────────

  let subtotal = 0;

  const validatedItems = [];

  for (const item of cartItems) {
    // IMPORTANT FIX
    const productId =
      item.productId?.toString();

    if (!productId) {
      throw {
        status: 400,
        message: "Invalid product ID",
      };
    }

    const product =
      productMap[productId];

    // ─────────────────────────────────────────────────────────
    // PRODUCT EXISTENCE
    // ─────────────────────────────────────────────────────────

    if (!product) {
      throw {
        status: 404,
        message: `Product not found: ${productId}`,
      };
    }

    // ─────────────────────────────────────────────────────────
    // PRODUCT STATUS
    // ─────────────────────────────────────────────────────────

    if (
      product.status !== "active"
    ) {
      throw {
        status: 400,
        message: `"${product.name}" is no longer available`,
      };
    }

    // ─────────────────────────────────────────────────────────
    // QUANTITY VALIDATION
    // ─────────────────────────────────────────────────────────

    const quantity = Number(
      item.quantity,
    );

    if (
      !quantity ||
      quantity < 1
    ) {
      throw {
        status: 400,
        message: `Invalid quantity for "${product.name}"`,
      };
    }

    // ─────────────────────────────────────────────────────────
    // SIZE VALIDATION
    // DB FORMAT:
    // sizes: [6,7,8,9]
    // ─────────────────────────────────────────────────────────

    let selectedSize = null;

    if (
      Array.isArray(product.sizes) &&
      product.sizes.length > 0
    ) {
      selectedSize = Number(
        item.selectedSize,
      );

      if (!selectedSize) {
        throw {
          status: 400,
          message: `Please select a size for "${product.name}"`,
        };
      }

      const sizeExists =
        product.sizes.includes(
          selectedSize,
        );

      if (!sizeExists) {
        throw {
          status: 400,
          message: `Size ${item.selectedSize} not available for "${product.name}"`,
        };
      }
    }

    // ─────────────────────────────────────────────────────────
    // STOCK VALIDATION
    // ─────────────────────────────────────────────────────────

    const stockAvailable =
      Number(product.stock) || 0;

    if (
      stockAvailable < quantity
    ) {
      throw {
        status: 400,
        message: `Only ${stockAvailable} unit(s) left for "${product.name}"`,
      };
    }

    // ─────────────────────────────────────────────────────────
    // PRICE CALCULATION
    // ─────────────────────────────────────────────────────────

    const productPrice =
      product.discountPrice ||
      product.price;

    const lineTotal =
      productPrice * quantity;

    subtotal += lineTotal;

    // ─────────────────────────────────────────────────────────
    // VALIDATED ITEM
    // ─────────────────────────────────────────────────────────

    validatedItems.push({
      product: product._id,

      name: product.name,

      slug: product.slug,

      image:
        product.thumbnail ||
        product.images?.[0] ||
        null,

      selectedSize,

      selectedColor:
        item.selectedColor ||
        product.colors?.[0] ||
        "Default",

      quantity,

      priceAtPurchase:
        productPrice,

      lineTotal,
    });
  }

  // ───────────────────────────────────────────────────────────
  // 5. COUPON VALIDATION
  // ───────────────────────────────────────────────────────────

  let discount = 0;

  let appliedCoupon = null;

  if (couponCode) {
    const coupon =
      await Coupon.findOne({
        code: couponCode
          .trim()
          .toUpperCase(),

        isActive: true,
      });

    if (!coupon) {
      throw {
        status: 400,
        message:
          "Invalid or expired coupon code",
      };
    }

    if (
      coupon.expiresAt &&
      coupon.expiresAt < new Date()
    ) {
      throw {
        status: 400,
        message:
          "This coupon has expired",
      };
    }

    if (
      coupon.minOrderAmount &&
      subtotal <
        coupon.minOrderAmount
    ) {
      throw {
        status: 400,
        message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`,
      };
    }

    if (
      coupon.usageLimit &&
      coupon.usedCount >=
        coupon.usageLimit
    ) {
      throw {
        status: 400,
        message:
          "This coupon usage limit has been reached",
      };
    }

    // DISCOUNT

    if (
      coupon.discountType ===
      "percent"
    ) {
      discount =
        (subtotal *
          coupon.discountValue) /
        100;

      if (coupon.maxDiscount) {
        discount = Math.min(
          discount,
          coupon.maxDiscount,
        );
      }
    } else {
      discount =
        coupon.discountValue;
    }

    discount =
      Math.round(discount);

    appliedCoupon = {
      _id: coupon._id,
      code: coupon.code,
      discountType:
        coupon.discountType,
      discountValue:
        coupon.discountValue,
    };
  }

  // ───────────────────────────────────────────────────────────
  // 6. FINAL TOTALS
  // ───────────────────────────────────────────────────────────

  const afterDiscount =
    subtotal - discount;

  const shippingFee =
    afterDiscount >=
    FREE_SHIP_THRESHOLD
      ? 0
      : SHIPPING_FEE;

  const taxableAmount =
    afterDiscount +
    shippingFee +
    PLATFORM_FEE;

  const tax = Math.round(
    taxableAmount * GST_RATE,
  );

  const totalAmount =
    afterDiscount +
    shippingFee +
    PLATFORM_FEE +
    tax;

  // ───────────────────────────────────────────────────────────
  // 7. FINAL RESPONSE
  // ───────────────────────────────────────────────────────────

  return {
    validatedItems,

    subtotal,

    discount,

    shippingFee,

    platformFee:
      PLATFORM_FEE,

    tax,

    totalAmount,

    appliedCoupon,
  };
};