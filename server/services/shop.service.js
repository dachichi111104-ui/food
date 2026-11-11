const { Shop, Product, ShopOrder } = require("../models");
const ApiError = require("../utils/ApiError");

const createShop = async (userId, data) => {
  const shop = await Shop.create({
    user_id: userId,
    name: data.name,
    description: data.description,
    address: data.address,
    city: data.city || "TP. Hồ Chí Minh",
    district: data.district,
    ward: data.ward,
    street: data.street,
    house_number: data.house_number,
    logo_url: data.logo_url,
    cover_url: data.cover_url,
    status: "pending", // Quán mới tạo luôn ở trạng thái chờ Admin duyệt
  });

  return shop;
};

const getMyShops = async (userId, query = {}) => {
  const filter = { user_id: userId };
  if (query.status) filter.status = query.status;
  const shops = await Shop.find(filter).sort({ createdAt: -1 });
  return shops;
};

const getMyShop = async (userId, shopId = null) => {
  const filter = { user_id: userId };
  if (shopId) filter._id = shopId;
  const shop = await Shop.findOne(filter).sort({ createdAt: -1 });
  if (!shop) {
    throw new ApiError(404, "You don't have a shop yet");
  }
  return shop;
};

const updateMyShop = async (userId, data, shopId = null) => {
  const filter = { user_id: userId };
  if (shopId) filter._id = shopId;
  const shop = await Shop.findOne(filter);
  if (!shop) {
    throw new ApiError(404, "You don't have a shop yet");
  }

  if (data.name) shop.name = data.name;
  if (data.description !== undefined) shop.description = data.description;
  if (data.address !== undefined) shop.address = data.address;
  if (data.city) shop.city = data.city;
  if (data.district !== undefined) shop.district = data.district;
  if (data.ward !== undefined) shop.ward = data.ward;
  if (data.street !== undefined) shop.street = data.street;
  if (data.house_number !== undefined) shop.house_number = data.house_number;
  if (data.logo_url) shop.logo_url = data.logo_url;
  if (data.cover_url) shop.cover_url = data.cover_url;

  // Nếu quán bị từ chối trước đó, khi sửa xong tự chuyển về pending để Admin duyệt lại
  if (shop.status === "rejected") {
    shop.status = "pending";
  }

  await shop.save();
  return shop;
};

// Public: chỉ trả shop đã approved + kèm order_count thật
const getPublicShop = async (shopId) => {
  const shop = await Shop.findOne({ _id: shopId, status: "approved" });
  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  const order_count = await ShopOrder.countDocuments({
    shop_id: shop._id,
    status: "COMPLETED",
  });

  return { ...shop.toObject(), order_count };
};

/**
 * listPublicShops
 * Hỗ trợ filter: search, category_id
 * Trả về kèm order_count (số đơn COMPLETED) cho từng shop
 * Sắp xếp: rating cao → mới nhất
 */
const listPublicShops = async ({ search, city, category_id, page = 1, limit = 20 }) => {
  const filter = { status: "approved" };

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (city) {
    const cleanCity = city.replace("TP.", "").replace(".", "").trim();
    const cityRegex = new RegExp(escapeRegex(cleanCity), "i");
    filter.$or = [{ city: { $regex: cityRegex } }, { address: { $regex: cityRegex } }];
  } else if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { name: { $regex: searchRegex } },
      { address: { $regex: searchRegex } },
      { city: { $regex: searchRegex } },
    ];
  }

  if (category_id) {
    const products = await Product.find(
      { category_id, is_active: true },
      { shop_id: 1 }
    ).lean();
    const shopIds = [...new Set(products.map((p) => p.shop_id.toString()))];
    filter._id = { $in: shopIds };
  }

  const shops = await Shop.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ rating: -1, createdAt: -1 })
    .lean();

  const total = await Shop.countDocuments(filter);

  // Aggregate order_count cho tất cả shop cùng lúc (1 query)
  const shopIds = shops.map((s) => s._id);
  const orderCounts = await ShopOrder.aggregate([
    { $match: { shop_id: { $in: shopIds }, status: "COMPLETED" } },
    { $group: { _id: "$shop_id", count: { $sum: 1 } } },
  ]);

  const orderCountMap = {};
  orderCounts.forEach((r) => { orderCountMap[r._id.toString()] = r.count; });

  const shopsWithCount = shops.map((s) => ({
    ...s,
    order_count: orderCountMap[s._id.toString()] || 0,
  }));

  return { shops: shopsWithCount, total, page: Number(page), limit: Number(limit) };
};

module.exports = { createShop, getMyShop, getMyShops, updateMyShop, getPublicShop, listPublicShops };