import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { config } from "../config/env.js";

// ─────────────────────────────────────────────────────────────────────────────
// authenticate
//
// Reads the accessToken cookie, strips the "Bearer " prefix that is stored
// in the cookie value (e.g. "Bearer eyJ..."), verifies the JWT, and attaches
// req.user = { id, role } for downstream middleware/routes.
//
// KEY FIXES vs original:
//   1. Uses next(new ApiError(...)) throughout instead of throw — throwing
//      inside an async catch block creates an unhandled rejection and never
//      reaches the Express error handler.
//   2. Strips "Bearer " prefix safely before calling jwt.verify.
// ─────────────────────────────────────────────────────────────────────────────

const authenticate = async (req, res, next) => {
  try {
    const raw = req.cookies?.accessToken;

    if (!raw) {
      return next(new ApiError(401, "Not authenticated"));
    }

    // Cookie is stored as "Bearer eyJ..." — strip the prefix before verifying
    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch {
      // jwt.verify throws TokenExpiredError, JsonWebTokenError, etc.
      return next(new ApiError(401, "Not authenticated"));
    }

    const userId = decoded?.id;
    if (!userId) {
      return next(new ApiError(401, "Not authenticated"));
    }

    const user = await User.findById(userId).select("role isDeleted");
    if (!user || user.isDeleted) {
      return next(new ApiError(401, "Not authenticated"));
    }

    req.user = { id: user._id, role: user.role };
    return next();
  } catch (err) {
    // Catches unexpected errors (e.g. DB down) — pass to global error handler
    return next(new ApiError(401, "Not authenticated"));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// authorizeRoles
// Usage: router.get("/admin", authenticate, authorizeRoles("admin"), handler)
// ─────────────────────────────────────────────────────────────────────────────

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!roles.includes(req.user.role))
      return next(new ApiError(403, "Forbidden"));
    return next();
  };
};

export default authenticate;
