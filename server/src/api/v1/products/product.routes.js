import { Router } from "express";
import multer from "multer";
const router = Router();

// Controllers
import { createProduct, getProducts, getRecommendedProducts } from "./product.controller.js";
import asyncHandler from "../../../middleware/asyncHandler.js";

import { handleMulter } from "../../../middleware/multer.js";

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/products/add",
  handleMulter(
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "thumbnail", maxCount: 1 },
    ]),
  ),
  asyncHandler(createProduct),
);

router.get("/products", asyncHandler(getProducts));
router.post("/recommended-products", asyncHandler(getRecommendedProducts));

export default router;
