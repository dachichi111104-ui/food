const mongoose = require("mongoose");

const shipperReviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipper_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOrder",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

shipperReviewSchema.index({ shop_order_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("ShipperReview", shipperReviewSchema);
