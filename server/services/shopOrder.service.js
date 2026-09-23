const mongoose = require("mongoose");
const { ShopOrder, OrderItem, Shipment, Shop } = require("../models");
const inventoryService = require("./inventory.service");
const { canTransition } = require("../utils/orderStateMachine");
const ApiError = require("../utils/ApiError");

const getShopOfUser = async (userId) => {
  const shop = await Shop.findOne({ user_id: userId });
  if (!shop) throw new ApiError(404, "You don't have a shop yet");
  return shop;
};

const listMyShopOrders = async (userId, { status, page = 1, limit = 10 }) => {
  const shop = await getShopOfUser(userId);

  const filter = { shop_id: shop._id };
  if (status) filter.status = status;

  const shopOrders = await ShopOrder.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const ids = shopOrders.map((so) => so._id);
  const items = await OrderItem.find({ shop_order_id: { $in: ids } });

  const total = await ShopOrder.countDocuments(filter);

  return {
    shopOrders: shopOrders.map((so) => ({
      ...so.toObject(),
      items: items.filter((i) => i.shop_order_id.toString() === so._id.toString()),
    })),
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

const getShopOrderOwned = async (userId, shopOrderId) => {
  const shop = await getShopOfUser(userId);
  const shopOrder = await ShopOrder.findOne({ _id: shopOrderId, shop_id: shop._id });
  if (!shopOrder) {
    throw new ApiError(404, "ShopOrder not found or not owned by your shop");
  }
  return shopOrder;
};

/**
 * Seller xác nhận đơn: PENDING_PAYMENT -> CONFIRMED
 * (đơn đã PAID mới tạo ShopOrder, nên đây là bước seller chủ động confirm)
 */
const confirmOrder = async (userId, shopOrderId) => {
  const shopOrder = await getShopOrderOwned(userId, shopOrderId);

  if (!canTransition(shopOrder.status, "CONFIRMED")) {
    throw new ApiError(
      400,
      `Cannot move from ${shopOrder.status} to CONFIRMED`
    );
  }

  shopOrder.status = "CONFIRMED";
  await shopOrder.save();
  return shopOrder;
};

/**
 * Chuyển trạng thái CONFIRMED -> PREPARING
 */
const startPreparing = async (userId, shopOrderId) => {
  const shopOrder = await getShopOrderOwned(userId, shopOrderId);

  if (!canTransition(shopOrder.status, "PREPARING")) {
    throw new ApiError(
      400,
      `Cannot move from ${shopOrder.status} to PREPARING`
    );
  }

  shopOrder.status = "PREPARING";
  await shopOrder.save();
  return shopOrder;
};

/**
 * Chuyển trạng thái PREPARING -> HANDED_TO_SHIPPER, đồng thời tạo Shipment.
 */
const handToShipper = async (userId, shopOrderId) => {
  const shopOrder = await getShopOrderOwned(userId, shopOrderId);

  if (!canTransition(shopOrder.status, "HANDED_TO_SHIPPER")) {
    throw new ApiError(
      400,
      `Cannot move from ${shopOrder.status} to HANDED_TO_SHIPPER`
    );
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      shopOrder.status = "HANDED_TO_SHIPPER";
      await shopOrder.save({ session });

      // Tạo Shipment nếu chưa có (unassigned - chờ Shipper nhận)
      const existing = await Shipment.findOne({ shop_order_id: shopOrder._id }).session(
        session
      );
      if (!existing) {
        await Shipment.create(
          [
            {
              shop_order_id: shopOrder._id,
              status: "UNASSIGNED",
            },
          ],
          { session }
        );
      }
    });
  } finally {
    await session.endSession();
  }

  return shopOrder;
};

/**
 * Seller hủy ShopOrder - chỉ được trước khi bàn giao Shipper.
 * Giải phóng reserved_quantity nếu đơn chưa PAID... nhưng lưu ý:
 * ở giai đoạn này Order đã PAID (vì ShopOrder chỉ đến CONFIRMED sau khi payment thành công),
 * nên stock đã bị trừ thật (commitStock ở Phase 6), KHÔNG còn reserved_quantity để giải phóng.
 * Việc hoàn lại stock cho trường hợp này cần cộng lại vào `stock` (hoàn kho), không phải release reserved.
 */
const cancelByShop = async (userId, shopOrderId, reason) => {
  const shopOrder = await getShopOrderOwned(userId, shopOrderId);

  if (!canTransition(shopOrder.status, "CANCELLED")) {
    throw new ApiError(
      400,
      `Cannot cancel ShopOrder at status ${shopOrder.status}`
    );
  }

  const items = await OrderItem.find({ shop_order_id: shopOrder._id });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Hoàn kho: vì thời điểm này stock đã bị trừ thật ở Phase 6 (commitStock),
      // nên seller hủy đơn nghĩa là phải cộng trả lại vào stock.
      const { ProductVariant } = require("../models");
      for (const item of items) {
        await ProductVariant.findOneAndUpdate(
          { _id: item.variant_id },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      shopOrder.status = "CANCELLED";
      shopOrder.cancel_reason = reason;
      await shopOrder.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return shopOrder;
};

module.exports = {
  listMyShopOrders,
  getShopOrderOwned,
  confirmOrder,
  startPreparing,
  handToShipper,
  cancelByShop,
};