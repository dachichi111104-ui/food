const { ProductVariant } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Atomic reserve: chỉ thành công nếu (stock - reserved_quantity) >= quantity.
 * Phải được gọi trong 1 session (transaction) khi checkout nhiều item.
 */
const reserveStock = async (variantId, quantity, session) => {
  const updated = await ProductVariant.findOneAndUpdate(
    {
      _id: variantId,
      $expr: { $gte: [{ $subtract: ["$stock", "$reserved_quantity"] }, quantity] },
    },
    { $inc: { reserved_quantity: quantity } },
    { new: true, session }
  );

  if (!updated) {
    throw new ApiError(409, `Not enough stock for variant ${variantId}`);
  }

  return updated;
};

/**
 * Giải phóng chỗ đã giữ (khi huỷ đơn / thanh toán thất bại).
 * Không trừ vào stock thật - chỉ giảm reserved_quantity.
 */
const releaseStock = async (variantId, quantity, session) => {
  await ProductVariant.findOneAndUpdate(
    { _id: variantId },
    { $inc: { reserved_quantity: -quantity } },
    { session }
  );
};

/**
 * Khi Order được xác nhận PAID: trừ thật vào stock, đồng thời giảm reserved_quantity
 * tương ứng (vì phần giữ chỗ giờ đã "thành hiện thực").
 */
const commitStock = async (variantId, quantity, session) => {
  await ProductVariant.findOneAndUpdate(
    { _id: variantId },
    { $inc: { stock: -quantity, reserved_quantity: -quantity } },
    { session }
  );
};

module.exports = { reserveStock, releaseStock, commitStock };