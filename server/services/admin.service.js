const { Shop, Category, ShopOrder, Order, OrderItem, User } = require("../models");
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

/**
 * Admin thống kê Dashboard:
 * - Tổng doanh thu
 * - Tổng đơn theo trạng thái
 * - Top 5 sản phẩm bán chạy
 * - Doanh thu 7 ngày gần nhất
 */
const getStats = async () => {
  // 1. Tổng doanh thu đơn hoàn tất / đã giao
  const revenueAgg = await ShopOrder.aggregate([
    {
      $match: { status: { $in: ["COMPLETED", "DELIVERED"] } },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $subtract: [
              { $add: ["$subtotal_amount", "$shipping_fee"] },
              { $ifNull: ["$discount_amount", 0] },
            ],
          },
        },
      },
    },
  ]);
  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  // 2. Tổng đơn và phân loại đơn theo trạng thái
  const statusAgg = await ShopOrder.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const ordersByStatus = {};
  let totalOrders = 0;
  statusAgg.forEach((item) => {
    ordersByStatus[item._id] = item.count;
    totalOrders += item.count;
  });

  // 3. Top 5 sản phẩm bán chạy nhất
  const topProducts = await OrderItem.aggregate([
    {
      $group: {
        _id: "$product_name_snapshot",
        totalQuantity: { $sum: "$quantity" },
        totalSales: { $sum: { $multiply: ["$price_at_order", "$quantity"] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  // 4. Doanh thu 7 ngày gần nhất
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentRevenueAgg = await ShopOrder.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $in: ["COMPLETED", "DELIVERED", "CONFIRMED", "PREPARING", "HANDED_TO_SHIPPER"] },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: {
          $sum: {
            $subtract: [
              { $add: ["$subtotal_amount", "$shipping_fee"] },
              { $ifNull: ["$discount_amount", 0] },
            ],
          },
        },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Format 7 ngày liên tục
  const recentRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = recentRevenueAgg.find((r) => r._id === dateStr);
    recentRevenue.push({
      date: dateStr,
      revenue: found ? found.revenue : 0,
      ordersCount: found ? found.ordersCount : 0,
    });
  }

  const totalShops = await Shop.countDocuments();
  const totalUsers = await User.countDocuments();

  return {
    totalRevenue,
    totalOrders,
    totalShops,
    totalUsers,
    ordersByStatus,
    topProducts,
    recentRevenue,
  };
};

module.exports = {
  listShopsForReview,
  approveShop,
  updateCategory,
  deleteCategory,
  listAllOrders,
  markRefunding,
  markRefunded,
  getStats,
};