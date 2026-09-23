const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null, // null = voucher toàn sàn
    },
    discount_type: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      required: true,
    },
    discount_value: { type: Number, required: true, min: 0 },
    min_order_amount: { type: Number, default: 0, min: 0 },
    max_discount_amount: { type: Number, default: null },
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },
    usage_limit: { type: Number, default: null }, // tổng số lần dùng tối đa
    used_count: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

voucherSchema.index({ shop_id: 1 });
voucherSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("Voucher", voucherSchema);