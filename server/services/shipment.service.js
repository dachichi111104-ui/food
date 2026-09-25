const { Shipment, ShopOrder, OrderItem, Shop } = require("../models");
const ApiError = require("../utils/ApiError");

const listAvailableShipments = async ({ page = 1, limit = 10 }) => {
  const shipments = await Shipment.find({ status: "UNASSIGNED" })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const enriched = await enrichShipments(shipments);
  const total = await Shipment.countDocuments({ status: "UNASSIGNED" });

  return { shipments: enriched, total, page: Number(page), limit: Number(limit) };
};

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

  const orderIds = shopOrders.map((so) => so.order_id);
  const { Order, User } = require("../models");
  const orders = await Order.find({ _id: { $in: orderIds } });

  const userIds = orders.map((o) => o.user_id);
  const users = await User.find({ _id: { $in: userIds } });

  const shopIds = shopOrders.map((so) => so.shop_id);
  const shops = await Shop.find({ _id: { $in: shopIds } });

  const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });

  return shipments.map((s) => {
    const shopOrder = shopOrders.find((so) => so._id.toString() === s.shop_order_id.toString());
    const order = shopOrder ? orders.find((o) => o._id.toString() === shopOrder.order_id.toString()) : null;
    const user = order ? users.find((u) => u._id.toString() === order.user_id.toString()) : null;
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
            recipient_name: user?.name || "Khách hàng",
            recipient_phone: user?.phone || "Chưa cập nhật SĐT",
            shipping_address: order?.shipping_address || shop?.city || "TP. Hồ Chí Minh",
            items: shopOrderItems,
          }
        : null,
    };
  });
};

const getShipmentOwned = async (shipperId, shipmentId) => {
  const shipment = await Shipment.findOne({ _id: shipmentId, shipper_id: shipperId });
  if (!shipment) {
    throw new ApiError(404, "Không tìm thấy đơn vận chuyển hoặc bạn không có quyền xử lý đơn này");
  }
  return shipment;
};

const claimShipment = async (shipperId, shipmentId) => {
  const shipment = await Shipment.findOneAndUpdate(
    { _id: shipmentId, status: "UNASSIGNED" },
    { shipper_id: shipperId, status: "ASSIGNED" },
    { new: true }
  );

  if (!shipment) {
    throw new ApiError(409, "Đơn hàng này đã được nhận bởi một tài xế shipper khác");
  }

  return shipment;
};

const confirmPickup = async (shipperId, shipmentId) => {
  const shipment = await getShipmentOwned(shipperId, shipmentId);

  if (shipment.status !== "ASSIGNED") {
    throw new ApiError(400, "Không thể xác nhận lấy hàng ở trạng thái hiện tại");
  }

  shipment.status = "HANDED_TO_SHIPPER";
  await shipment.save();
  return shipment;
};

const markDelivered = async (shipperId, shipmentId) => {
  const shipment = await getShipmentOwned(shipperId, shipmentId);

  if (shipment.status !== "HANDED_TO_SHIPPER") {
    throw new ApiError(400, "Không thể xác nhận giao hàng ở trạng thái hiện tại");
  }

  shipment.status = "DELIVERED";
  await shipment.save();

  const shopOrder = await ShopOrder.findOneAndUpdate(
    { _id: shipment.shop_order_id },
    { status: "COMPLETED" },
    { new: true }
  );

  if (shopOrder) {
    const { Order } = require("../models");
    const remainingUnfinished = await ShopOrder.countDocuments({
      order_id: shopOrder.order_id,
      status: { $nin: ["DELIVERED", "COMPLETED", "CANCELLED"] },
    });
    if (remainingUnfinished === 0) {
      await Order.findByIdAndUpdate(shopOrder.order_id, { status: "COMPLETED" });
    }
  }

  return shipment;
};

module.exports = {
  listAvailableShipments,
  listMyShipments,
  claimShipment,
  confirmPickup,
  markDelivered,
};