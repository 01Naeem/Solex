const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;

// 📌 Example Usage

// import asyncHandler from "./utils/asyncHandler.js";
// import express from "express";

// const router = express.Router();

// const createProduct = asyncHandler(async (req, res) => {
//   // logic here
//   res.status(201).json({ success: true });
// });

// router.post("/products", createProduct);

// export default router;