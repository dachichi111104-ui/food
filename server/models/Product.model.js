const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image_url: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ shop_id: 1 });
productSchema.index({ category_id: 1 });

module.exports = mongoose.model("Product", productSchema);