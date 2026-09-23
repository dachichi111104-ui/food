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
    logo_url: { type: String },
    cover_url: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

shopSchema.index({ user_id: 1 });
shopSchema.index({ status: 1 });

module.exports = mongoose.model("Shop", shopSchema);