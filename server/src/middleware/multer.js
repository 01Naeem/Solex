import multer from "multer";

/**
 * =========================================================
 * 📌 STORAGE CONFIGURATION
 * =========================================================
 *
 * We use `memoryStorage` instead of `diskStorage` because:
 *
 * - Files are NOT stored on server disk
 * - Files are kept in memory as Buffer (req.file.buffer)
 * - Perfect for direct upload to Cloudinary / S3
 *
 * ⚠️ Important:
 * Avoid large file uploads when using memory storage
 * (handled via file size limits below)
 */
const storage = multer.memoryStorage();

/**
 * =========================================================
 * 📌 FILE FILTER (VALIDATION)
 * =========================================================
 *
 * This function validates incoming file types.
 * Only allows:
 * - jpeg / jpg
 * - png
 * - webp
 *
 * If invalid → reject with custom error
 */
const fileFilter = (req, file, cb) => {
  try {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // accept file
    } else {
      const error = new Error(
        "Invalid file type. Only JPEG, JPG, PNG, WEBP allowed."
      );
      error.code = "INVALID_FILE_TYPE";
      cb(error, false);
    }
  } catch (err) {
    cb(err, false);
  }
};

/**
 * =========================================================
 * 📌 LIMITS CONFIGURATION
 * =========================================================
 *
 * - fileSize: max size per file (5MB)
 * - protects server from large payload attacks
 */
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

/**
 * =========================================================
 * 📌 MULTER INSTANCE
 * =========================================================
 */
const upload = multer({
  storage,
  fileFilter,
  limits,
});

/**
 * =========================================================
 * 📌 ERROR HANDLER WRAPPER (IMPORTANT)
 * =========================================================
 *
 * This ensures:
 * - Multer errors are properly formatted
 * - Works smoothly with asyncHandler
 *
 * Handles:
 * - LIMIT_FILE_SIZE
 * - INVALID_FILE_TYPE
 * - Unexpected field errors
 */
export const handleMulter = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (!err) return next();

    // Multer-specific errors
    if (err instanceof multer.MulterError) {
      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          return res.status(400).json({
            success: false,
            message: "File size exceeds 5MB limit",
          });

        case "LIMIT_UNEXPECTED_FILE":
          return res.status(400).json({
            success: false,
            message: "Unexpected file field",
          });

        default:
          return res.status(400).json({
            success: false,
            message: err.message,
          });
      }
    }

    // Custom file filter error
    if (err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Unknown errors
    return res.status(500).json({
      success: false,
      message: "File upload failed",
      error: err.message,
    });
  });
};

/**
 * =========================================================
 * 📌 EXPORTABLE MIDDLEWARES
 * =========================================================
 */

/**
 * Single Image Upload
 * Usage:
 * uploadSingleImage("image")
 */
export const uploadSingleImage = (fieldName) =>
  handleMulter(upload.single(fieldName));

/**
 * Multiple Image Upload
 * Usage:
 * uploadMultipleImages("images", 5)
 */
export const uploadMultipleImages = (fieldName, maxCount = 5) =>
  handleMulter(upload.array(fieldName, maxCount));