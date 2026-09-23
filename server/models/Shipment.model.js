const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    shop_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOrder",
      required: true,
      unique: true,
    },
    shipper_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["UNASSIGNED", "ASSIGNED", "HANDED_TO_SHIPPER", "DELIVERED"],
      default: "UNASSIGNED",
      required: true,
    },
  },
  { timestamps: true }
);

shipmentSchema.index({ shop_order_id: 1 }, { unique: true });
shipmentSchema.index({ shipper_id: 1 });

module.exports = mongoose.model("Shipment", shipmentSchema);