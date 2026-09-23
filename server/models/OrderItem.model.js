const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    shop_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOrder",
      required: true,
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    product_name_snapshot: { type: String, required: true }, // lưu lại tên tại thời điểm đặt
    variant_name_snapshot: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price_at_order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

orderItemSchema.index({ shop_order_id: 1 });

module.exports = mongoose.model("OrderItem", orderItemSchema);