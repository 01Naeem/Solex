/**
 * controllers/payment/webhookHandler.js
 * Solex — Razorpay Webhook Handler
 *
 * Handles:
 *   - payment.captured
 *   - payment.failed
 *   - order.paid
 *   - refund.processed
 *
 * Security:
 *   - Webhook signature verification
 *   - Immediate 200 ACK
 *   - Idempotency via WebhookEvent model
 *   - Mongoose transactions
 *
 * IMPORTANT:
 * Register this route BEFORE express.json() middleware.
 *
 * app.use(
 *   "/api/payments/webhook",
 *   express.raw({ type: "application/json" })
 * );
 */

import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../../../models/Order.model.js";

import {
  Transaction,
  WebhookEvent,
} from "../../../models/Transaction.model.js";

import {
  reduceStock,
} from "../../../services/inventoryService.js";

// ── Verify Razorpay webhook signature ─────────────────────
const verifyWebhookSignature = (
  rawBody,
  signature
) => {
  try {
    const expected = crypto
      .createHmac(
        "sha256",
        process.env
          .RAZORPAY_WEBHOOK_SECRET
      )
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
};

const webhookHandler = async (
  req,
  res
) => {
  const signature =
    req.headers[
      "x-razorpay-signature"
    ];

  if (!signature) {
    return res.status(400).json({
      error:
        "Missing webhook signature",
    });
  }

  // req.body is raw Buffer
  if (
    !verifyWebhookSignature(
      req.body,
      signature
    )
  ) {
    console.warn(
      "[Solex Webhook] Invalid signature — possible spoofed request"
    );

    return res.status(400).json({
      error: "Invalid signature",
    });
  }

  // ── ACK immediately ────────────────────────────────────
  res.status(200).json({
    received: true,
  });

  // ── Parse payload ──────────────────────────────────────
  let payload;

  try {
    payload = JSON.parse(
      req.body.toString()
    );
  } catch {
    console.error(
      "[Solex Webhook] Failed to parse webhook body"
    );

    return;
  }

  const { event } = payload;

  // Razorpay doesn't provide UUID
  const eventId = `${payload.account_id}_${payload.created_at}_${event}`;

  // ── Idempotency ────────────────────────────────────────
  try {
    const exists =
      await WebhookEvent.findOne({
        eventId,
      });

    if (exists) {
      console.log(
        `[Solex Webhook] Duplicate skipped: ${eventId}`
      );

      return;
    }

    await WebhookEvent.create({
      eventId,
      event,
    });
  } catch (err) {
    if (err.code === 11000) {
      console.log(
        `[Solex Webhook] Race condition duplicate skipped: ${eventId}`
      );

      return;
    }

    console.error(
      "[Solex Webhook] Idempotency check failed:",
      err.message
    );

    return;
  }

  const session =
    await mongoose.startSession();

  session.startTransaction();

  try {
    // ─────────────────────────────────────────────────────
    // payment.captured
    // ─────────────────────────────────────────────────────
    if (
      event ===
      "payment.captured"
    ) {
      const payment =
        payload.payload.payment
          .entity;

      const order =
        await Order.findOne({
          razorpayOrderId:
            payment.order_id,

          paymentStatus: {
            $ne: "paid",
          },
        }).session(session);

      if (order) {
        // Reduce stock
        await reduceStock(
          order.items,
          session
        );

        order.paymentStatus =
          "paid";

        order.razorpayPaymentId =
          payment.id;

        order.statusHistory.push({
          status: "paid",
          note:
            "Confirmed via payment.captured webhook",
        });

        await order.save({
          session,
        });

        await Transaction.findOneAndUpdate(
          {
            razorpayOrderId:
              payment.order_id,
          },
          {
            status: "success",

            razorpayPaymentId:
              payment.id,

            gatewayResponse:
              payment,
          },
          { session }
        );
      }

      // ───────────────────────────────────────────────────
      // payment.failed
      // ───────────────────────────────────────────────────
    } else if (
      event ===
      "payment.failed"
    ) {
      const payment =
        payload.payload.payment
          .entity;

      await Order.findOneAndUpdate(
        {
          razorpayOrderId:
            payment.order_id,

          paymentStatus:
            "pending",
        },
        {
          paymentStatus:
            "failed",

          $push: {
            statusHistory: {
              status: "failed",

              note:
                payment.error_description ||
                "Payment failed",
            },
          },
        },
        { session }
      );

      await Transaction.findOneAndUpdate(
        {
          razorpayOrderId:
            payment.order_id,
        },
        {
          status: "failed",

          gatewayResponse:
            payment,
        },
        { session }
      );

      // ───────────────────────────────────────────────────
      // refund.processed
      // ───────────────────────────────────────────────────
    } else if (
      event ===
      "refund.processed"
    ) {
      const refund =
        payload.payload.refund
          .entity;

      const isPartial =
        refund.notes?.partial ===
        "true";

      const newStatus =
        isPartial
          ? "partially_refunded"
          : "refunded";

      await Order.findOneAndUpdate(
        {
          razorpayPaymentId:
            refund.payment_id,
        },
        {
          paymentStatus:
            newStatus,

          $push: {
            statusHistory: {
              status: newStatus,

              note: `Refund ₹${
                refund.amount / 100
              } processed`,
            },
          },
        },
        { session }
      );

      await Transaction.findOneAndUpdate(
        {
          razorpayPaymentId:
            refund.payment_id,
        },
        {
          status: "refunded",

          gatewayResponse:
            refund,
        },
        { session }
      );
    }

    await session.commitTransaction();

    console.log(
      `[Solex Webhook] Processed: ${event}`
    );
  } catch (err) {
    await session.abortTransaction();

    console.error(
      `[Solex Webhook] Error processing ${event}:`,
      err.message
    );
  } finally {
    session.endSession();
  }
};

export default webhookHandler;