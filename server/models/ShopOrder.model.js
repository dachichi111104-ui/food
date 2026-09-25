const mongoose = require("mongoose");

const shopOrderSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    subtotal_amount: { type: Number, required: true, min: 0 },
    shipping_fee: { type: Number, required: true, default: 15000, min: 0 },
    payment_method: {
      type: String,
      enum: ["COD", "VNPAY"],
      default: "VNPAY",
    },
    recipient_name: { type: String, default: "" },
    recipient_phone: { type: String, default: "" },
    shipping_address: { type: String, default: "" },
    voucher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
    discount_amount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "CONFIRMED",
        "PREPARING",
        "HANDED_TO_SHIPPER",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDING",
        "REFUNDED",
      ],
      default: "PENDING_PAYMENT",
      required: true,
    },
    cancel_reason: { type: String, trim: true },
  },
  { timestamps: true }
);

shopOrderSchema.index({ order_id: 1 });
shopOrderSchema.index({ shop_id: 1, status: 1 });

module.exports = mongoose.model("ShopOrder", shopOrderSchema);