import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import pLimit from "p-limit";
import { config } from "./env.js";

// ===============================
// 📌 Cloudinary Configuration
// ===============================
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

// ===============================
// 📌 Constants
// ===============================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ===============================
// 📌 Validate File
// ===============================
const validateFile = (file) => {
  if (!file) throw new Error("No file provided");

  if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error("Invalid file type. Only JPG, PNG, WEBP allowed.");
  }

  if (file.size && file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }
};

// ===============================
// 📌 Stream Upload Helper
// ===============================
const uploadFromBuffer = (inputBuffer, options) =>
  new Promise((resolve, reject) => {
    try {
      // 🔥 CRITICAL FIX: Normalize to Node Buffer
      let buffer;

      if (Buffer.isBuffer(inputBuffer)) {
        buffer = inputBuffer;
      } else if (inputBuffer instanceof ArrayBuffer) {
        buffer = Buffer.from(new Uint8Array(inputBuffer));
      } else if (ArrayBuffer.isView(inputBuffer)) {
        buffer = Buffer.from(inputBuffer.buffer);
      } else {
        throw new Error("Invalid buffer type received");
      }

      // 🧪 Debug (optional)
      // console.log("Is Buffer:", Buffer.isBuffer(buffer));

      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const readable = streamifier.createReadStream(buffer);

      readable.on("error", reject);
      stream.on("error", reject);

      readable.pipe(stream);
    } catch (err) {
      reject(err);
    }
  });

// ===============================
// 📌 Generate Public ID
// ===============================
const generatePublicId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

// ===============================
// 📌 Upload Single Image
// ===============================
export const uploadSingleImage = async (file, folder, resize = {}) => {
  try {
    validateFile(file);

    const options = {
      folder,
      resource_type: "image",
      public_id: generatePublicId(),
      transformation: [
        {
          quality: "auto:good",
          fetch_format: "auto",
          flags: "progressive",
          ...(resize.width && { width: resize.width }),
          ...(resize.height && { height: resize.height }),
          ...(resize.width || resize.height ? { crop: "limit" } : {}),
        },
      ],
    };

    let result;

    // 📌 Buffer (Multer memory)
    if (file.buffer || file instanceof ArrayBuffer) {
      const buffer = file.buffer || file;
      result = await uploadFromBuffer(buffer, options);
    }
    // 📌 Local file path
    else if (typeof file === "string" || file.path) {
      const filePath = typeof file === "string" ? file : file.path;
      result = await cloudinary.uploader.upload(filePath, options);
    } else {
      throw new Error("Invalid file format");
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    error.message = `Cloudinary single upload failed: ${error.message}`;
    throw error;
  }
};

// ===============================
// 📌 Upload Multiple Images (Controlled Concurrency)
// ===============================
export const uploadMultipleImages = async (files, folder, resize = {}) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("No files provided for multiple upload");
    }

    const limit = pLimit(3); // max 3 uploads at a time

    const uploadPromises = files.map((file) =>
      limit(() => uploadSingleImage(file, folder, resize)),
    );

    const results = await Promise.all(uploadPromises);

    return results.map((res) => ({
      url: res.secure_url,
      public_id: res.public_id,
    }));
  } catch (error) {
    error.message = `Cloudinary multiple upload failed: ${error.message}`;
    throw error;
  }
};

// ===============================
// 📌 Delete Single Image
// ===============================
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) throw new Error("Public ID is required");

    const result = await cloudinary.uploader.destroy(publicId);

    if (!["ok", "not found"].includes(result.result)) {
      throw new Error("Failed to delete image");
    }

    return result;
  } catch (error) {
    error.message = `Cloudinary delete failed: ${error.message}`;
    throw error;
  }
};

// ===============================
// 📌 Delete Multiple Images
// ===============================
export const deleteMultipleImages = async (publicIds = []) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      throw new Error("No public IDs provided");
    }

    const result = await cloudinary.api.delete_resources(publicIds);

    return result;
  } catch (error) {
    error.message = `Cloudinary bulk delete failed: ${error.message}`;
    throw error;
  }
};

// ===============================
export { cloudinary };
