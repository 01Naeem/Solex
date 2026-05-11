import slugify from "slugify";
import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../../../models/Product.model.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
} from "../../../config/cloudinary.js";
import asyncHandler from "../../../middleware/asyncHandler.js";

// Utility: Safe JSON parse
const parseJSON = (value) => {
  try {
    if (!value) return [];
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return [];
  }
};

// Utility: Generate unique slug
const generateUniqueSlug = async (name) => {
  let baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;

  const exists = await Product.findOne({ slug });
  if (exists) {
    const suffix = crypto.randomBytes(3).toString("hex");
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

// 📌 Controller
export const createProduct = asyncHandler(async (req, res) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  let uploadedPublicIds = [];

  try {
    console.log("🔥 Controller HIT");

    // 📌 Extract input
    let {
      name,
      slug,
      sku,
      brand,
      category,
      gender,
      price,
      discountPrice,
      stock,
      description,
      features,
      sizes,
      colors,
      status,
      featured,
      metaTitle,
      metaDescription,
    } = req.body;

    // 📌 Normalize
    name = name?.trim();
    brand = brand?.trim();
    category = category?.trim();

    sizes = parseJSON(sizes);
    colors = parseJSON(colors);
    features = parseJSON(features);

    price = Number(price);
    discountPrice = discountPrice ? Number(discountPrice) : undefined;
    stock = Number(stock);

    // 📌 Validations
    if (!name || !price || !category || stock === undefined) {
      throw new Error("Missing required fields");
    }

    if (discountPrice && discountPrice >= price) {
      throw new Error("Discount price must be less than price");
    }

    if (!sizes.length || !colors.length) {
      throw new Error("Sizes and colors are required");
    }

    if (!req.files?.thumbnail || !req.files?.images) {
      throw new Error("Thumbnail and images are required");
    }

    // 📌 SKU uniqueness
    const existingSKU = await Product.findOne({ sku });
    if (existingSKU) {
      throw new Error("SKU must be unique");
    }

    // 📌 Slug
    slug = slug
      ? slugify(slug, { lower: true, strict: true })
      : await generateUniqueSlug(name);

    // =========================================================
    // 🔥 CRITICAL FIX: Ensure Buffer (NOT ArrayBuffer)
    // =========================================================
    const toBuffer = (file) => {
      if (Buffer.isBuffer(file.buffer)) return file.buffer;
      return Buffer.from(file.buffer);
    };

    // 📌 Upload Thumbnail
    const thumbFile = req.files.thumbnail[0];

    const thumbnailUpload = await uploadSingleImage(
      toBuffer(thumbFile), // 🔥 FIX
      "solex/products/thumbnails",
      { width: 800 },
    );

    uploadedPublicIds.push(thumbnailUpload.public_id);

    // 📌 Upload Gallery Images
    const galleryUploads = await Promise.all(
      req.files.images.map((file) =>
        uploadSingleImage(
          toBuffer(file), // 🔥 FIX
          "solex/products/gallery",
          { width: 1000 },
        ),
      ),
    );

    galleryUploads.forEach((img) => uploadedPublicIds.push(img.public_id));

    // 📌 Create Product
    const product = await Product.create(
      [
        {
          name,
          slug,
          sku,
          brand,
          category,
          gender,
          price,
          discountPrice,
          stock,
          description,
          features,
          sizes,
          colors,
          thumbnail: thumbnailUpload.secure_url,
          images: galleryUploads.map((img) => img.secure_url),
          status,
          featured,
          metaTitle,
          metaDescription,
        },
      ],
      // { session },
    );

    // await session.commitTransaction();
    // session.endSession();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product[0],
    });
  } catch (error) {
    console.error("🔥 ERROR:", error);

    // await session.abortTransaction();
    // session.endSession();

    // 📌 Cleanup uploaded images
    if (uploadedPublicIds.length) {
      await Promise.all(uploadedPublicIds.map((id) => deleteImage(id)));
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


export const getProducts = async (req, res) => {
  
  const products = await Product.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: products,
  });
  
}

export const getRecommendedProducts =
  async (req, res, next) => {
    try {
      const {
        categories,
        productIds,
      } = req.body;
      /**
       * Validation
       */

      if (
        !categories ||
        !Array.isArray(categories)
      ) {
        return res.status(400).json({
          success: false,
          message: "Categories required",
        });
      }

      /**
       * Find Recommended Products
       */

      const products = await Product.find({
        category: {
          $in: categories,
        },

        _id: {
          $nin: productIds,
        },

        isDeleted: false,
        status: "active",
      })
        .limit(12)
        .sort({
          createdAt: -1,
        });


      return res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };