const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

cartItemSchema.index({ cart_id: 1 });
// Một variant chỉ xuất hiện 1 lần trong 1 cart (tránh trùng dòng)
cartItemSchema.index({ cart_id: 1, variant_id: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);