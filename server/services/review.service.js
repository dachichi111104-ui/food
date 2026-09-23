const { Review, OrderItem, ShopOrder, Order, ProductVariant, Product, Shop } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Sau khi tạo review, tính lại shop.rating từ toàn bộ Review
 * thuộc sản phẩm của shop đó và cập nhật vào Shop document.
 */
const recalculateShopRating = async (shopId) => {
  // Lấy tất cả product thuộc shop
  const products = await Product.find({ shop_id: shopId }).select("_id").lean();
  const productIds = products.map((p) => p._id);

  // Lấy tất cả variant thuộc các product đó
  const variants = await ProductVariant.find({ product_id: { $in: productIds } }).select("_id").lean();
  const variantIds = variants.map((v) => v._id);

  // Lấy tất cả OrderItem thuộc các variant đó
  const orderItems = await OrderItem.find({ variant_id: { $in: variantIds } }).select("_id").lean();
  const orderItemIds = orderItems.map((oi) => oi._id);

  // Tính trung bình rating từ tất cả review liên quan
  const aggResult = await Review.aggregate([
    { $match: { order_item_id: { $in: orderItemIds } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const newRating = aggResult[0] ? parseFloat(aggResult[0].avgRating.toFixed(1)) : 0;
  await Shop.findByIdAndUpdate(shopId, { rating: newRating });
  return newRating;
};

/**
 * Tạo review cho 1 OrderItem cụ thể.
 * Điều kiện:
 * 1. OrderItem phải thuộc về ShopOrder đã COMPLETED
 * 2. OrderItem phải thuộc về Order của chính Buyer đang gọi API
 * 3. Mỗi OrderItem chỉ được review 1 lần (đã có unique index ở model)
 */
const createReview = async (userId, { order_item_id, rating, comment }) => {
  const orderItem = await OrderItem.findById(order_item_id);
  if (!orderItem) {
    throw new ApiError(404, "Order item not found");
  }

  const shopOrder = await ShopOrder.findById(orderItem.shop_order_id);
  if (!shopOrder || shopOrder.status !== "COMPLETED") {
    throw new ApiError(400, "You can only review items from a completed order");
  }

  const order = await Order.findOne({ _id: shopOrder.order_id, user_id: userId });
  if (!order) {
    throw new ApiError(403, "This order item does not belong to you");
  }

  const existing = await Review.findOne({ order_item_id });
  if (existing) {
    throw new ApiError(409, "This item has already been reviewed");
  }

  const review = await Review.create({
    order_item_id,
    user_id: userId,
    rating,
    comment,
  });

  // Cập nhật lại rating của shop ngay sau khi có review mới
  const variant = await ProductVariant.findById(orderItem.variant_id).select("product_id").lean();
  if (variant) {
    const product = await Product.findById(variant.product_id).select("shop_id").lean();
    if (product) {
      await recalculateShopRating(product.shop_id);
    }
  }

  return review;
};


/**
 * Xem review công khai theo product (thông qua variant -> product).
 * Dùng cho trang chi tiết sản phẩm.
 */
const listReviewsByProduct = async (productId, { page = 1, limit = 10 }) => {
  const { ProductVariant } = require("../models");

  const variants = await ProductVariant.find({ product_id: productId }).select("_id");
  const variantIds = variants.map((v) => v._id);

  const orderItems = await OrderItem.find({ variant_id: { $in: variantIds } }).select("_id");
  const orderItemIds = orderItems.map((oi) => oi._id);

  const reviews = await Review.find({ order_item_id: { $in: orderItemIds } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("user_id", "name");

  const total = await Review.countDocuments({ order_item_id: { $in: orderItemIds } });

  const avgResult = await Review.aggregate([
    { $match: { order_item_id: { $in: orderItemIds } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  return {
    reviews,
    total,
    page: Number(page),
    limit: Number(limit),
    average_rating: avgResult[0] ? Number(avgResult[0].avgRating.toFixed(1)) : null,
  };
};

module.exports = { createReview, listReviewsByProduct };