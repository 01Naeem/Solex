import express from "express";
import jwt from "jsonwebtoken";
import User from "../../../models/User.model.js";
import ApiError from "../../../utils/ApiErrror.js";
import { config } from "../../../config/env.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/refresh
//
// Called automatically by the axios response interceptor when a 401 is hit.
// Reads the refreshToken cookie, issues a new accessToken cookie.
// No body params needed — everything comes from cookies.
// ─────────────────────────────────────────────────────────────────────────────

router.post("/refresh", async (req, res, next) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return next(new ApiError(401, "No refresh token"));

    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch {
      return next(new ApiError(401, "Refresh token expired or invalid"));
    }

    const user = await User.findById(decoded.id).select("role isDeleted");
    if (!user || user.isDeleted) {
      return next(new ApiError(401, "User not found"));
    }

    // Issue a fresh access token (15 min)
    const newAccessToken = jwt.sign(
      { id: user._id },
      config.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", `Bearer ${newAccessToken}`, {
      httpOnly: true,
      sameSite: "Strict",
      // secure: true,   // ← uncomment in production (HTTPS only)
      maxAge: 15 * 60 * 1000, // 15 minutes in ms
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return next(new ApiError(500, "Could not refresh token"));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout
//
// Clears both cookies. Call this on your logout button.
// ─────────────────────────────────────────────────────────────────────────────

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", { sameSite: "Strict" });
  res.clearCookie("refreshToken", { sameSite: "Strict" });
  return res.status(200).json({ success: true });
});

export default router;
