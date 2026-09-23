const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    order_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ order_item_id: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);