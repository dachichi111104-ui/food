const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true }, // vd: "Size M", "Không đá"
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reserved_quantity: { type: Number, required: true, min: 0, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productVariantSchema.index({ product_id: 1 });

// Virtual field tiện lợi: số lượng thực sự còn có thể bán
productVariantSchema.virtual("available").get(function () {
  return this.stock - this.reserved_quantity;
});

productVariantSchema.set("toJSON", { virtuals: true });
productVariantSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("ProductVariant", productVariantSchema);