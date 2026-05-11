/**
 * controllers/payment/createOrder.js
 * Solex — Create Razorpay Order
 *
 * Flow:
 *   1. Validate + price cart
 *   2. Create Razorpay order
 *   3. Save order + transaction
 *   4. Return payment data
 */

import mongoose from "mongoose";

import razorpay from "../../../config/razorpay.js";

import Order from "../../../models/Order.model.js";

import { Transaction } from "../../../models/Transaction.model.js";

import { validateAndPriceCart } from "../../../services/cartValidationService.js";

// ─────────────────────────────────────────────────────────────
// GENERATE INVOICE ID
// ─────────────────────────────────────────────────────────────

const generateInvoiceId = () => {
  const ts = Date.now().toString(36).toUpperCase();

  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `SOLEX-${ts}-${rand}`;
};

// ─────────────────────────────────────────────────────────────
// CREATE ORDER
// ─────────────────────────────────────────────────────────────

const createOrder = async (req, res) => {


  try {
    // ─────────────────────────────────────────────────────────
    // AUTH VALIDATION
    // ─────────────────────────────────────────────────────────

    const userId = req.user?.id;

    if (!userId) {
 

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ─────────────────────────────────────────────────────────
    // REQUEST BODY
    // ─────────────────────────────────────────────────────────

    const { cartItems, shippingAddress, couponCode } = req.body;

    // ─────────────────────────────────────────────────────────
    // VALIDATE CART
    // ─────────────────────────────────────────────────────────

    const {
      validatedItems,

      subtotal,

      discount,

      shippingFee,

      platformFee,

      tax,

      totalAmount,

      appliedCoupon,
    } = await validateAndPriceCart(cartItems, couponCode);

    // ─────────────────────────────────────────────────────────
    // CREATE RAZORPAY ORDER
    // ─────────────────────────────────────────────────────────

    const amountInPaise = Math.round(totalAmount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,

      currency: "INR",

      receipt: `solex_${Date.now()}`,

      notes: {
        userId: String(userId),
      },
    });

    // ─────────────────────────────────────────────────────────
    // CREATE ORDER
    // ─────────────────────────────────────────────────────────

    const invoiceId = generateInvoiceId();

    const [order] = await Order.create(
      [
        {
          user: userId,

          items: validatedItems,

          shippingAddress,

          subtotal,

          discount,

          shippingFee,

          platformFee,

          tax,

          totalAmount,

          paymentMethod: "razorpay",

          paymentStatus: "pending",

          orderStatus: "processing",

          razorpayOrderId: rzpOrder.id,

          invoiceId,

          coupon: appliedCoupon?._id || null,

          couponCode: appliedCoupon?.code || null,

          statusHistory: [
            {
              status: "pending",

              note: "Order created",
            },
          ],
        },
      ],
    );

    // ─────────────────────────────────────────────────────────
    // CREATE TRANSACTION LOG
    // ─────────────────────────────────────────────────────────

    await Transaction.create(
      [
        {
          order: order._id,

          user: userId,

          razorpayOrderId: rzpOrder.id,

          amount: totalAmount,

          currency: "INR",

          status: "initiated",

          ipAddress: req.ip,
        },
      ],
    );

    // ─────────────────────────────────────────────────────────
    // COMMIT TRANSACTION
    // ─────────────────────────────────────────────────────────


    // ─────────────────────────────────────────────────────────
    // SUCCESS RESPONSE
    // ─────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,

      message: "Order created successfully",

      data: {
        razorpayOrderId: rzpOrder.id,

        amount: amountInPaise,

        currency: "INR",

        orderId: order._id,

        breakdown: {
          subtotal,

          discount,

          shippingFee,

          platformFee,

          tax,

          totalAmount,
        },
      },
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);


    return res.status(err.statusCode || 500).json({
      success: false,

      message: err.message || "Order creation failed",
    });
  } finally {
  }
};

export default createOrder;
