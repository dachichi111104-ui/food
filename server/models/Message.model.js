const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender_name: { type: String, required: true },
    sender_role: { type: String, required: true },
    target_role: {
      type: String,
      enum: ["buyer", "seller", "shipper", "admin"],
      required: true,
    },
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOrder",
      default: null,
    },
    order_code: { type: String, default: "" },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    shop_name: { type: String, default: "" },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

messageSchema.index({ target_role: 1, createdAt: -1 });
messageSchema.index({ order_id: 1 });
messageSchema.index({ shop_id: 1 });
messageSchema.index({ recipient_id: 1 });

module.exports = mongoose.model("Message", messageSchema);
