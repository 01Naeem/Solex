import bcrypt from "bcryptjs";
import User from "../../../models/User.model.js";
import asyncHandler from "../../../middleware/asyncHandler.js";
import ApiError from "../../../utils/apiErrror.js";
import productModel from "../../../models/Product.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/generateTokens.js";
import { config } from "../../../config/env.js";

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = asyncHandler(async (req, res) => {
  // 🔹 1. Extract & sanitize input (validation assumed handled via Zod middleware)
  let { name, email, password, phone } = req.body;

  name = name.trim();
  email = email.toLowerCase().trim();
  if (phone) phone = phone.trim();

  // 🔹 2. Check existing user (avoid user enumeration → generic message)
  const existingUser = await User.findOne({ email, isDeleted: false }).lean();

  if (existingUser) {
    throw new ApiError(409, "Unable to register with provided credentials");
  }

  // 🔹 3. Create user (password hashed in schema middleware)
  let user;
  try {
    user = await User.create({
      name,
      email,
      password,
      phone,
    });
  } catch (err) {
    // 🔹 Handle race condition (duplicate email)
    if (err.code === 11000) {
      throw new ApiError(409, "User already exists");
    }
    throw err;
  }

  // 🔹 4. Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Get user agent and IP address for session tracking
  const userAgent = req.headers["user-agent"];
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress;

  // 🔹 5. Rotate refresh token (invalidate old one if exists)
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }

  const MAX_SESSIONS = 10; // limit to 10 active sessions per user

  if (user.refreshTokens.length >= MAX_SESSIONS) {
    user.refreshTokens.shift(); // remove oldest
  }

  user.refreshTokens.push({
    token: hashedRefreshToken,
    userAgent,
    ip: ipAddress,
    createdAt: new Date(),
  });

  await user.save({ validateBeforeSave: false });

  // 🔹 6. Cookie configuration (centralized)
  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...(config.NODE_ENV === "production" && {
      domain: config.COOKIE_DOMAIN,
    }),
  };

  // 🔹 7. Set cookies
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 🔹 8. Prepare safe response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };

  // 🔹 9. Response
  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: userResponse,
  });
});

// Login controller

// ================= REGEX =================
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// ================= CONTROLLER =================
export const loginUser = asyncHandler(async (req, res) => {
  // 1. Destructure input
  const { email, password } = req.body;

  // 2. Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // 3. Find user
  const user = await User.findOne({ email }).select("+password +refreshTokens");

  if (!user) {
    // Avoid revealing whether email exists
    throw new ApiError(401, "Invalid email or password");
  }

  // 4. Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 5. Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 6. get user agent and ip address

  const userAgent = req.headers["user-agent"];
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress;

  // 7. Store refresh token in DB (multi-device safe)

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  // ensure array exists
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }

  const MAX_SESSIONS = 10; // limit to 10 active sessions per user

  if (user.refreshTokens.length >= MAX_SESSIONS) {
    user.refreshTokens.shift(); // remove oldest
  }

  // push new session
  user.refreshTokens.push({
    token: hashedRefreshToken,
    createdAt: new Date(),
    userAgent: userAgent,
    ip: ipAddress,
  });

  await user.save({ validateBeforeSave: false });

  // 8. Remove sensitive fields
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshTokens;

  // 9. Cookie options (secure)
  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...(config.NODE_ENV === "production" && {
      domain: config.COOKIE_DOMAIN,
    }),
  };

  // 10. Send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 min
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      success: true,
      message: "Login successful",
      user: userData,
      accessToken,
      refreshToken,
    });
});

export const getProducts = asyncHandler(async (req, res) => {
  // For demonstration, returning static data. Replace with DB query in production.
  try {
    const products = await productModel
      .find()
      .sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch new arrivals",
    });
  }
});
