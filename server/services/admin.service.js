const { Shop, Category, ShopOrder, Order } = require("../models");
const { canTransition } = require("../utils/orderStateMachine");
const ApiError = require("../utils/ApiError");

const listShopsForReview = async ({ status, page = 1, limit = 10 }) => {
  const filter = {};
  if (status) filter.status = status;

  const shops = await Shop.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Shop.countDocuments(filter);
  return { shops, total, page: Number(page), limit: Number(limit) };
};

const approveShop = async (shopId, status) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");

  shop.status = status; // "approved" | "rejected"
  await shop.save();
  return shop;
};

const updateCategory = async (categoryId, data) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, "Category not found");

  if (data.name) category.name = data.name;
  if (data.parent_id !== undefined) category.parent_id = data.parent_id;
  await category.save();
  return category;
};

const deleteCategory = async (categoryId) => {
  const { Product } = require("../models");
  const inUse = await Product.exists({ category_id: categoryId });
  if (inUse) {
    throw new ApiError(409, "Cannot delete category currently used by products");
  }
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

/**
 * Admin xem toàn bộ Order trong hệ thống (giám sát), không giới hạn theo user.
 */
const listAllOrders = async ({ status, page = 1, limit = 10 }) => {
  const filter = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);
  return { orders, total, page: Number(page), limit: Number(limit) };
};

/**
 * Admin đánh dấu hoàn tiền thủ công.
 * Chỉ áp dụng cho ShopOrder đã DELIVERED hoặc COMPLETED (theo state machine).
 * MVP không hoàn tiền tự động qua gateway - chỉ ghi nhận trạng thái + ghi chú.
 */
const markRefunding = async (shopOrderId) => {
  const shopOrder = await ShopOrder.findById(shopOrderId);
  if (!shopOrder) throw new ApiError(404, "ShopOrder not found");

  if (!canTransition(shopOrder.status, "REFUNDING")) {
    throw new ApiError(400, `Cannot move from ${shopOrder.status} to REFUNDING`);
  }

  shopOrder.status = "REFUNDING";
  await shopOrder.save();
  return shopOrder;
};

const markRefunded = async (shopOrderId, note) => {
  const shopOrder = await ShopOrder.findById(shopOrderId);
  if (!shopOrder) throw new ApiError(404, "ShopOrder not found");

  if (!canTransition(shopOrder.status, "REFUNDED")) {
    throw new ApiError(400, `Cannot move from ${shopOrder.status} to REFUNDED`);
  }

  shopOrder.status = "REFUNDED";
  shopOrder.cancel_reason = note; // tái dùng field này để lưu ghi chú hoàn tiền
  await shopOrder.save();
  return shopOrder;
};

module.exports = {
  listShopsForReview,
  approveShop,
  updateCategory,
  deleteCategory,
  listAllOrders,
  markRefunding,
  markRefunded,
};