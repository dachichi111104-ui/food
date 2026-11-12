const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    subtotal_amount: { type: Number, default: 0, min: 0 },
    shipping_fee: { type: Number, default: 15000, min: 0 },
    total_amount: { type: Number, required: true, min: 0 },
    payment_method: {
      type: String,
      enum: ["COD", "VNPAY"],
      default: "VNPAY",
    },
    payment_status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    recipient_name: { type: String, default: "" },
    recipient_phone: { type: String, default: "" },
    shipping_address: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "UNPAID_COD", "PAID", "COMPLETED", "CANCELLED"],
      default: "PENDING_PAYMENT",
      required: true,
    },
    voucher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
    discount_amount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);