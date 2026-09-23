const { Shipment, ShopOrder, OrderItem, Shop } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Danh sách đơn đang chờ Shipper nhận (chưa ai nhận).
 * Đây là "pool" chung cho mọi Shipper, không phân biệt khu vực (MVP không có GPS).
 */
const listAvailableShipments = async ({ page = 1, limit = 10 }) => {
  const shipments = await Shipment.find({ status: "UNASSIGNED" })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const enriched = await enrichShipments(shipments);
  const total = await Shipment.countDocuments({ status: "UNASSIGNED" });

  return { shipments: enriched, total, page: Number(page), limit: Number(limit) };
};

/**
 * Đơn đã được gán cho Shipper đang đăng nhập.
 */
const listMyShipments = async (shipperId, { status, page = 1, limit = 10 }) => {
  const filter = { shipper_id: shipperId };
  if (status) filter.status = status;

  const shipments = await Shipment.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const enriched = await enrichShipments(shipments);
  const total = await Shipment.countDocuments(filter);

  return { shipments: enriched, total, page: Number(page), limit: Number(limit) };
};

const enrichShipments = async (shipments) => {
  const shopOrderIds = shipments.map((s) => s.shop_order_id);
  const shopOrders = await ShopOrder.find({ _id: { $in: shopOrderIds } });

  const shopIds = shopOrders.map((so) => so.shop_id);
  const shops = await Shop.find({ _id: { $in: shopIds } });

  const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });

  return shipments.map((s) => {
    const shopOrder = shopOrders.find((so) => so._id.toString() === s.shop_order_id.toString());
    const shop = shopOrder ? shops.find((sh) => sh._id.toString() === shopOrder.shop_id.toString()) : null;
    const shopOrderItems = shopOrder
      ? items.filter((i) => i.shop_order_id.toString() === shopOrder._id.toString())
      : [];

    return {
      shipment_id: s._id,
      status: s.status,
      shop_order: shopOrder
        ? {
            id: shopOrder._id,
            status: shopOrder.status,
            subtotal_amount: shopOrder.subtotal_amount,
            shipping_fee: shopOrder.shipping_fee,
            shop_name: shop ? shop.name : null,
            shop_address: shop ? shop.address : null,
            items: shopOrderItems,
          }
        : null,
    };
  });
};

const getShipmentOwned = async (shipperId, shipmentId) => {
  const shipment = await Shipment.findOne({ _id: shipmentId, shipper_id: shipperId });
  if (!shipment) {
    throw new ApiError(404, "Shipment not found or not assigned to you");
  }
  return shipment;
};

/**
 * Shipper nhận đơn: UNASSIGNED -> ASSIGNED, gán shipper_id.
 * Dùng atomic findOneAndUpdate để tránh 2 Shipper cùng nhận 1 đơn (race-condition nhẹ).
 */
const claimShipment = async (shipperId, shipmentId) => {
  const shipment = await Shipment.findOneAndUpdate(
    { _id: shipmentId, status: "UNASSIGNED" },
    { shipper_id: shipperId, status: "ASSIGNED" },
    { new: true }
  );

  if (!shipment) {
    throw new ApiError(409, "This order has already been claimed by another shipper");
  }

  return shipment;
};

/**
 * Shipper xác nhận đã lấy hàng: ASSIGNED -> HANDED_TO_SHIPPER.
 * Đồng bộ ShopOrder (giữ nguyên HANDED_TO_SHIPPER, đã đúng từ Phase 7).
 */
const confirmPickup = async (shipperId, shipmentId) => {
  const shipment = await getShipmentOwned(shipperId, shipmentId);

  if (shipment.status !== "ASSIGNED") {
    throw new ApiError(400, `Cannot confirm pickup from status ${shipment.status}`);
  }

  shipment.status = "HANDED_TO_SHIPPER";
  await shipment.save();
  return shipment;
};

/**
 * Shipper xác nhận đã giao xong: HANDED_TO_SHIPPER -> DELIVERED.
 * Đồng bộ sang ShopOrder.status = DELIVERED.
 */
const markDelivered = async (shipperId, shipmentId) => {
  const shipment = await getShipmentOwned(shipperId, shipmentId);

  if (shipment.status !== "HANDED_TO_SHIPPER") {
    throw new ApiError(400, `Cannot mark delivered from status ${shipment.status}`);
  }

  shipment.status = "DELIVERED";
  await shipment.save();

  await ShopOrder.findOneAndUpdate(
    { _id: shipment.shop_order_id, status: "HANDED_TO_SHIPPER" },
    { status: "DELIVERED" }
  );

  return shipment;
};

module.exports = {
  listAvailableShipments,
  listMyShipments,
  claimShipment,
  confirmPickup,
  markDelivered,
};