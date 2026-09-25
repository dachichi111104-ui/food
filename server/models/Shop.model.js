const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, default: "TP. Hồ Chí Minh", trim: true },
    district: { type: String, trim: true },
    ward: { type: String, trim: true },
    street: { type: String, trim: true },
    house_number: { type: String, trim: true },
    logo_url: { type: String },
    cover_url: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "hidden"],
      default: "pending",
      required: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

shopSchema.index({ user_id: 1 });
shopSchema.index({ status: 1 });
shopSchema.index({ city: 1 });

module.exports = mongoose.model("Shop", shopSchema);