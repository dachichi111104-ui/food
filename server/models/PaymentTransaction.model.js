const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    method: {
      type: String,
      enum: ["VNPAY"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      required: true,
    },
    gateway_transaction_ref: {
      type: String,
      required: true,
      unique: true,
    },
    raw_response: { type: mongoose.Schema.Types.Mixed }, // lưu payload gốc từ gateway để debug
  },
  { timestamps: true }
);

paymentTransactionSchema.index({ order_id: 1 });
paymentTransactionSchema.index(
  { gateway_transaction_ref: 1 },
  { unique: true }
);

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);