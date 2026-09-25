const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin", "shipper"],
      default: "buyer",
      required: true,
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    ward: { type: String, trim: true },
    street: { type: String, trim: true },
    house_number: { type: String, trim: true },
    avatar_url: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);