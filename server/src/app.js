/**
 * app.js — Solex Backend
 * ES6 Module Version
 *
 * IMPORTANT:
 * Webhook route MUST be registered BEFORE express.json()
 * because Razorpay webhook verification needs raw request body.
 */

import express from "express";
import dotenv from "dotenv"
import cors from "cors";
import { config } from "./config/env.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import errorHandler from "./middleware/error.middleware.js";
import authenticate from "./middleware/auth.middleware.js";

// Routes
import userRoutes from "./api/v1/users/user.routes.js";
import productRoutes from "./api/v1/products/product.routes.js";
import paymentRoutes from "../src/api/v1/payment/payment.routes.js";
import authRefreshRoutes from "./api/v1/auth/auth.refresh.routes.js"; // ← NEW

// Load env

const app = express();
dotenv.config();

// ─────────────────────────────────────────────────────────────
// 1. Security Headers
// ─────────────────────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────────────────────
// 2. Debug Logger
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ─────────────────────────────────────────────────────────────
// 3. CORS
// ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      config.CLIENT_URL,
      config.CLIENT_URL_PROD
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─────────────────────────────────────────────────────────────
// 4. Cookie Parser
// ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// 5. Razorpay Webhook Route
// MUST COME BEFORE express.json()
// ─────────────────────────────────────────────────────────────
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// ─────────────────────────────────────────────────────────────
// 6. JSON Parsers
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// 7. Health Check
// ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "solex-api" });
});

// ─────────────────────────────────────────────────────────────
// 8. Application Routes
// ─────────────────────────────────────────────────────────────

// User routes (login, register, etc.)
app.use("/api", userRoutes);

// Auth refresh + logout  ← NEW
// Exposes: POST /api/auth/refresh
//          POST /api/auth/logout
app.use("/api/auth", authRefreshRoutes);

// Public product routes
app.use("/api", productRoutes);

// Admin product routes
app.use("/api/admin", authenticate, productRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

// ─────────────────────────────────────────────────────────────
// 9. 404 Handler
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────────────────────
// 10. Global Error Handler
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// 11. Start Server
// ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Solex server running on ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;
