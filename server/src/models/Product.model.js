import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    // 📌 Core Fields
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex",
      index: true,
    },

    // 📌 Pricing & Inventory
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return value == null || value < this.price;
        },
        message: "Discount price must be less than the original price",
      },
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // 📌 Description & Features
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],

    // 📌 Variants
    sizes: [
      {
        type: Number,
        required: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    // 📌 Images
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    // 📌 Status & Flags
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "active",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 📌 SEO & Metadata
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    // 📌 Analytics Fields
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 📌 Indexes
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text" });

// 📌 Virtual: Discount %
productSchema.virtual("discountPercentage").get(function () {
  if (!this.discountPrice || this.price === 0) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// ✅ FIXED: No next()
productSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
