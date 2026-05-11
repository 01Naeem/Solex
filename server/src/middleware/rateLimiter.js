import rateLimit from "express-rate-limit";

// 🔒 Payment Routes Limiter

export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 5, // 10 payment attempts per IP

  message: {
    success: false,
    message: "Too many payment attempts. Try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// 🌐 Global API Limiter

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});