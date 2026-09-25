const { Report, ShopOrder, Shipment, User, Shop } = require("../models");
const ApiError = require("../utils/ApiError");

const createReport = async (userId, payload) => {
  const { shop_order_id, target_type = "shop", reason, description, images = [] } = payload;

  let shipper_id = null;
  if (shop_order_id) {
    const shipment = await Shipment.findOne({ shop_order_id });
    if (shipment) shipper_id = shipment.shipper_id;
  }

  const report = await Report.create({
    user_id: userId,
    shop_order_id: shop_order_id || null,
    target_type,
    shipper_id,
    reason,
    description,
    images: Array.isArray(images) ? images : [],
  });

  return report;
};

const listReports = async ({ status, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;

  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const userIds = [...new Set(reports.map((r) => r.user_id?.toString()).filter(Boolean))];
  const shipperIds = [...new Set(reports.map((r) => r.shipper_id?.toString()).filter(Boolean))];
  const shopOrderIds = [...new Set(reports.map((r) => r.shop_order_id?.toString()).filter(Boolean))];

  const users = await User.find({ _id: { $in: [...userIds, ...shipperIds] } }, { name: 1, phone: 1 }).lean();
  const shopOrders = await ShopOrder.find({ _id: { $in: shopOrderIds } }).lean();
  const shopIds = [...new Set(shopOrders.map((so) => so.shop_id?.toString()).filter(Boolean))];
  const shops = await Shop.find({ _id: { $in: shopIds } }, { name: 1 }).lean();

  const userMap = {}; users.forEach((u) => { userMap[u._id.toString()] = u; });
  const shopOrderMap = {}; shopOrders.forEach((so) => { shopOrderMap[so._id.toString()] = so; });
  const shopMap = {}; shops.forEach((sh) => { shopMap[sh._id.toString()] = sh; });

  const enrichedReports = reports.map((r) => {
    const user = userMap[r.user_id?.toString()] || {};
    const shipper = userMap[r.shipper_id?.toString()] || {};
    const shopOrder = shopOrderMap[r.shop_order_id?.toString()] || {};
    const shop = shopMap[shopOrder.shop_id?.toString()] || {};

    return {
      ...r,
      user_name: user.name || "Người dùng",
      user_phone: user.phone || "",
      shipper_name: shipper.name || "Tài xế Shipper",
      shop_name: shop.name || "Quán ăn",
    };
  });

  const total = await Report.countDocuments(filter);
  return { reports: enrichedReports, total, page: Number(page), limit: Number(limit) };
};

const resolveReport = async (reportId, resolution_note) => {
  const report = await Report.findById(reportId);
  if (!report) throw new ApiError(404, "Không tìm thấy khiếu nại này");

  report.status = "RESOLVED";
  report.resolution_note = resolution_note || "Đã kiểm tra và xử lý khiếu nại thành công";
  await report.save();
  return report;
};

module.exports = { createReport, listReports, resolveReport };