const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PAID", "CANCELLED"],
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