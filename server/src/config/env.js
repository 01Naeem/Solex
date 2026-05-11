import dotenv from "dotenv";
import { z } from "zod";

// Load env variables
dotenv.config();

/**
 * Define schema (STRICT validation)
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

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

  // Example future variables
  MONGO_URI_TEST: z.string()
    .min(1, "MONGO_URI is required")
    .refine((val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"), {
      message: "MONGO_URI must be a valid MongoDB connection string",
    }),
  JWT_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

/**
 * Parse & validate env
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1); // fail fast (VERY IMPORTANT)
}

/**
 * Export validated config
 */
export const config = Object.freeze(parsed.data);