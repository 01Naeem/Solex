/**
 * routes/payment.routes.js
 * Solex — Payment API Routes
 *
 * CRITICAL ORDER in app.js / server.js:
 *
 *   // 1. Webhook FIRST — needs raw Buffer
 *   app.use(
 *     "/api/payments/webhook",
 *     express.raw({ type: "application/json" })
 *   );
 *
 *   // 2. JSON parser AFTER
 *   app.use(express.json());
 *
 *   // 3. Routes
 *   app.use("/api/payments", paymentRoutes);
 *
 * Routes:
 *   POST /api/payments/webhook
 *   POST /api/payments/create-order
 *   POST /api/payments/verify
 *   POST /api/payments/retry/:orderId
 *   POST /api/payments/refund/:orderId
 */

import express from "express";
import rateLimit from "express-rate-limit";

// Controllers
import createOrder from "./createOrder.js";
import verifyPayment from "./verifyPayment.js";
import webhookHandler from "./webhookHandler.js";
import { retryPayment, initiateRefund } from "./refundAndRetry.js";

// Middleware
import authenticate from "../../../middleware/auth.middleware.js";

// import authorize from "../middleware/authorize.js";
const router = express.Router();

// ── Rate limiter ──────────────────────────────────────────
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many payment attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────────────────
// WEBHOOK ROUTE
// Must be registered BEFORE express.json()
// ──────────────────────────────────────────────────────────
router.post("/webhook", webhookHandler);

// ──────────────────────────────────────────────────────────
// AUTHENTICATED PAYMENT ROUTES
// ──────────────────────────────────────────────────────────
router.use(authenticate);

router.use(paymentLimiter);

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify payment
router.post("/verify", verifyPayment);

// Retry failed payment
router.post("/retry/:orderId", retryPayment);

// Admin refund route
router.post(
  "/refund/:orderId",

  // authorize("admin"),

  initiateRefund,
);

export default router;
