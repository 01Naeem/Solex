import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // 🔒 exclude by default
    },

    phone: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional field
          return /^\+?[1-9]\d{1,14}$/.test(v); // E.164 format
        },
        message: "Please provide a valid international phone number",
      },
    },

    // ✅ Address Field Added (for future order/shipping use)

    address: {
      fullName: {
        type: String,
        trim: true,
      },

      phoneNumber: {
        type: String,
        trim: true,
      },

      street: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },

      landmark: {
        type: String,
        trim: true,
      },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String, // URL (Cloudinary, etc.)
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        userAgent: String,
        ip: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ---

// ## 🔐 Password Hashing Middleware

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---

// ## 🔑 Instance Method: Compare Password

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ---

// ## ⚡ Static Method: Check Email Exists

userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

// ---

// ## 🧼 Clean JSON Output (Hide Sensitive Fields)

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.__v;
  delete obj.isDeleted;

  return obj;
};

// ---

// ## 📊 Indexes (Performance Optimization)

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ---

// ## 🚀 Model Export

const User = mongoose.model("User", userSchema);
export default User;
