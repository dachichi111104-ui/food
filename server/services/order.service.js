const mongoose = require("mongoose");
const { Order, ShopOrder, OrderItem, Cart, CartItem } = require("../models");
const cartService = require("./cart.service");
const inventoryService = require("./inventory.service");
const ApiError = require("../utils/ApiError");
const { canTransition } = require("../utils/orderStateMachine");

/**
 * Checkout: Cart -> Order + nhiều ShopOrder + nhiều OrderItem.
 * Toàn bộ chạy trong 1 transaction: nếu bất kỳ variant nào hết hàng,
 * rollback toàn bộ, không tạo Order nào cả.
 */
const checkout = async (userId) => {
  const { shopOrders: groups, order_total } = await cartService.getCartGroupedByShop(userId);

  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      // 1. Tạo Order tổng, trạng thái PENDING_PAYMENT
      const [order] = await Order.create(
        [
          {
            user_id: userId,
            total_amount: order_total,
            status: "PENDING_PAYMENT",
          },
        ],
        { session }
      );

      // 2. Với mỗi shop, tạo ShopOrder + OrderItem + reserve stock từng variant
      for (const group of groups) {
        const [shopOrder] = await ShopOrder.create(
          [
            {
              order_id: order._id,
              shop_id: group.shop_id,
              subtotal_amount: group.subtotal_amount,
              shipping_fee: group.shipping_fee,
              status: "PENDING_PAYMENT",
            },
          ],
          { session }
        );

        for (const item of group.items) {
          // Reserve tồn kho atomic - throw ApiError(409) nếu không đủ hàng,
          // sẽ tự động rollback toàn bộ transaction nhờ session.withTransaction
          await inventoryService.reserveStock(item.variant.id, item.quantity, session);

          await OrderItem.create(
            [
              {
                shop_order_id: shopOrder._id,
                variant_id: item.variant.id,
                product_name_snapshot: item.product.name,
                variant_name_snapshot: item.variant.name,
                quantity: item.quantity,
                price_at_order: item.variant.price,
              },
            ],
            { session }
          );
        }
      }

      // 3. Xoá cart sau khi tạo Order thành công
      const cart = await Cart.findOne({ user_id: userId }).session(session);
      await CartItem.deleteMany({ cart_id: cart._id }).session(session);

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  return getOrderDetail(userId, createdOrder._id);
};

const getOrderDetail = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const shopOrders = await ShopOrder.find({ order_id: order._id });
  const shopOrderIds = shopOrders.map((so) => so._id);
  const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });

  return {
    order,
    shopOrders: shopOrders.map((so) => ({
      ...so.toObject(),
      items: items.filter((i) => i.shop_order_id.toString() === so._id.toString()),
    })),
  };
};

const listMyOrders = async (userId, { page = 1, limit = 10 }) => {
  const orders = await Order.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments({ user_id: userId });

  return { orders, total, page: Number(page), limit: Number(limit) };
};

/**
 * Huỷ đơn theo điều kiện nghiệp vụ:
 * Buyer chỉ huỷ được khi TẤT CẢ ShopOrder đang ở PENDING_PAYMENT hoặc CONFIRMED.
 * Huỷ sẽ giải phóng reserved_quantity của toàn bộ item trong Order.
 */
const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status !== "PENDING_PAYMENT") {
    throw new ApiError(400, "Only orders pending payment can be cancelled by buyer");
  }

  const shopOrders = await ShopOrder.find({ order_id: order._id });
  const nonCancellable = shopOrders.some(
    (so) => !["PENDING_PAYMENT", "CONFIRMED"].includes(so.status)
  );
  if (nonCancellable) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  const shopOrderIds = shopOrders.map((so) => so._id);
  const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of items) {
        await inventoryService.releaseStock(item.variant_id, item.quantity, session);
      }
      order.status = "CANCELLED";
      await order.save({ session });

      await ShopOrder.updateMany(
        { order_id: order._id },
        { status: "CANCELLED" },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  return getOrderDetail(userId, orderId);
};

// Thêm hàm mới, đặt cạnh cancelOrder
/**
 * Buyer xác nhận đã nhận hàng: DELIVERED -> COMPLETED.
 * Chỉ chủ đơn (user_id trùng) mới xác nhận được, thông qua Order -> ShopOrder.
 */
const completeShopOrder = async (userId, shopOrderId) => {
  const { ShopOrder, Order } = require("../models");

  const shopOrder = await ShopOrder.findById(shopOrderId);
  if (!shopOrder) {
    throw new ApiError(404, "ShopOrder not found");
  }

  const order = await Order.findOne({ _id: shopOrder.order_id, user_id: userId });
  if (!order) {
    throw new ApiError(404, "ShopOrder not found or not owned by you");
  }

  if (!canTransition(shopOrder.status, "COMPLETED")) {
    throw new ApiError(400, `Cannot move from ${shopOrder.status} to COMPLETED`);
  }

  shopOrder.status = "COMPLETED";
  await shopOrder.save();
  return shopOrder;
};

// Nhớ thêm vào module.exports
module.exports = { checkout, getOrderDetail, listMyOrders, cancelOrder, completeShopOrder };
