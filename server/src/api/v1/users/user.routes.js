import express from "express";
import { signupUser, loginUser, getProducts } from "./user.controller.js";
const router = express.Router();

// Public auth routes
router.post("/auth/signup", signupUser);
router.post("/auth/login", loginUser);

// Public products list (getProducts from auth controller)
router.get("/get-products", getProducts);

export default router;
