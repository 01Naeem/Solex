import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

/**
 * Environment Variable Schema Validation
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z
    .string()
    .default("5000")
    .transform((val) => {
      const port = Number(val);

      if (isNaN(port)) {
        throw new Error("PORT must be a number");
      }

      return port;
    }),

  // Frontend URLs
  CLIENT_URL: z.string().url(),
  CLIENT_URL_PROD: z.string().url(),

  // MongoDB
  MONGO_URI_TEST: z
    .string()
    .min(1, "MONGO_URI_TEST is required")
    .refine(
      (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
      {
        message: "MONGO_URI_TEST must be a valid MongoDB URI",
      },
    ),

  // JWT
  JWT_SECRET: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

/**
 * Validate Environment Variables
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid Environment Variables");
  console.error(parsed.error.format());

  process.exit(1);
}

/**
 * Export Validated Config
 */
export const config = Object.freeze(parsed.data);
