const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOrder",
      default: null,
    },
    reason: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
      required: true,
    },
    resolution_note: { type: String, trim: true },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1 });
reportSchema.index({ user_id: 1 });

module.exports = mongoose.model("Report", reportSchema);