/**
 * controllers/payment/verifyPayment.js
 * Solex — Verify Razorpay Payment
 */

import crypto from "crypto";

import Order from "../../../models/Order.model.js";
import { Transaction } from "../../../models/Transaction.model.js";
import Coupon from "../../../models/Coupon.model.js";
import { reduceStock } from "../../../services/inventoryService.js";

const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  // ── 1. Verify HMAC signature ───────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(razorpay_signature, "hex")
  );

  if (!signaturesMatch) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed: invalid signature",
    });
  }

  // ── 2. Idempotency check ───────────────────────────────
  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (existingOrder.paymentStatus === "paid") {
    return res.status(200).json({
      success: true,
      message: "Payment already verified",
      data: { orderId: existingOrder._id },
    });
  }

  if (existingOrder.paymentStatus === "failed") {
    return res.status(400).json({
      success: false,
      message: "This order was marked as failed. Use retry payment.",
    });
  }

  try {
    // ── 3. Fetch order ─────────────────────────────────────
    const order = await Order.findOne({
      _id: orderId,
      razorpayOrderId: razorpay_order_id,
      paymentStatus: "pending",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or already processed",
      });
    }

    // ── 4. Reduce inventory ────────────────────────────────
    await reduceStock(order.items);

    // ── 5. Update order ────────────────────────────────────
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.statusHistory.push({
      status: "paid",
      note: "Payment verified via HMAC signature",
    });

    await order.save();

    // ── 6. Update transaction log ──────────────────────────
    await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
      }
    );

    // ── 7. Increment coupon usage ──────────────────────────
    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        $inc: { usedCount: 1 },
      });
    }

    // ── 8. Async post-payment tasks ────────────────────────
    setImmediate(() => {
      // clearUserCart(order.user).catch(console.error);
      // generateInvoicePDF(order._id).catch(console.error);
      // sendOrderConfirmationEmail(order._id).catch(console.error);
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: { orderId: order._id },
    });
  } catch (err) {
    console.error("[Solex] verifyPayment error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Payment verification failed",
    });
  }
};

export default verifyPayment;