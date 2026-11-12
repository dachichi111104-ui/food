const mongoose = require("mongoose");
const { Order, ShopOrder, OrderItem, Cart, CartItem, Review, User, Voucher, ProductVariant } = require("../models");
const cartService = require("./cart.service");
const inventoryService = require("./inventory.service");
const voucherService = require("./voucher.service");
const emailService = require("./email.service");
const ApiError = require("../utils/ApiError");
const { canTransition } = require("../utils/orderStateMachine");

/**
 * Checkout: Cart -> Order + nhiều ShopOrder + nhiều OrderItem.
 * Toàn bộ chạy trong 1 transaction: nếu bất kỳ variant nào hết hàng,
 * rollback toàn bộ, không tạo Order nào cả.
 */
const checkout = async (userId, payload = {}) => {
  const {
    shop_id = null,
    payment_method = "VNPAY",
    recipient_name = "",
    recipient_phone = "",
    shipping_address = "",
    voucher_code = "",
  } = payload;

  const { shopOrders: groups } = await cartService.getCartGroupedByShop(userId, shop_id);

  if (!groups || groups.length === 0) {
    throw new ApiError(400, "Giỏ hàng của bạn đang trống.");
  }

  // Luôn đảm bảo 1 ĐƠN HÀNG = 1 QUÁN ĂN (Single-Shop Order)
  // Nếu giỏ hàng có nhiều quán mà chưa chọn shop_id, mặc định lấy quán đầu tiên
  const selectedGroup = groups[0];
  const orderSubtotal = selectedGroup.subtotal_amount;
  const orderShippingFee = selectedGroup.shipping_fee || 15000;
  const orderTotalBeforeDiscount = orderSubtotal + orderShippingFee;

  // Xử lý áp dụng voucher nếu có
  let voucherData = null;
  let discountAmount = 0;
  if (voucher_code && voucher_code.trim()) {
    voucherData = await voucherService.applyVoucher({
      code: voucher_code.trim(),
      order_subtotal: orderSubtotal,
    });
    discountAmount = voucherData.discount_amount || 0;
  }

  const finalTotal = Math.max(0, orderTotalBeforeDiscount - discountAmount);

  const session = await mongoose.startSession();
  let createdOrder;

  const isCOD = payment_method === "COD";
  const initialOrderStatus = isCOD ? "UNPAID_COD" : "PENDING_PAYMENT";
  const initialPaymentStatus = "PENDING";
  const initialShopOrderStatus = isCOD ? "CONFIRMED" : "PENDING_PAYMENT";

  try {
    await session.withTransaction(async () => {
      // 1. Tạo Order gắn liền trực tiếp với đúng Quán ăn (Single-Shop)
      const [order] = await Order.create(
        [
          {
            user_id: userId,
            shop_id: selectedGroup.shop_id,
            subtotal_amount: orderSubtotal,
            shipping_fee: orderShippingFee,
            total_amount: finalTotal,
            payment_method,
            payment_status: initialPaymentStatus,
            recipient_name,
            recipient_phone,
            shipping_address,
            status: initialOrderStatus,
            voucher_id: voucherData?.voucher_id || null,
            discount_amount: discountAmount,
          },
        ],
        { session }
      );

      // Cập nhật lượt sử dụng của voucher
      if (voucherData?.voucher_id) {
        await Voucher.findByIdAndUpdate(
          voucherData.voucher_id,
          { $inc: { used_count: 1 } },
          { session }
        );
      }

      // 2. Tạo 1 ShopOrder tương ứng cho Quán quản lý và chuẩn bị món
      const [shopOrder] = await ShopOrder.create(
        [
          {
            order_id: order._id,
            shop_id: selectedGroup.shop_id,
            subtotal_amount: orderSubtotal,
            shipping_fee: orderShippingFee,
            payment_method,
            payment_status: initialPaymentStatus,
            recipient_name,
            recipient_phone,
            shipping_address,
            voucher_id: voucherData?.voucher_id || null,
            discount_amount: discountAmount,
            status: initialShopOrderStatus,
          },
        ],
        { session }
      );

      for (const item of selectedGroup.items) {
        // Reserve tồn kho atomic - throw ApiError(409) nếu không đủ hàng
        await inventoryService.reserveStock(item.variant.id, item.quantity, session);

        // Nếu là COD, hàng đã xác nhận xuất kho: commitStock ngay trong transaction
        if (isCOD) {
          await inventoryService.commitStock(item.variant.id, item.quantity, session);
        }

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

      // 3. Xoá các món của shop này khỏi Cart sau khi tạo Order thành công
      const cart = await Cart.findOne({ user_id: userId }).session(session);
      if (cart) {
        const itemIdsToRemove = selectedGroup.items.map((i) => i.item_id);
        await CartItem.deleteMany({
          _id: { $in: itemIdsToRemove },
          cart_id: cart._id,
        }).session(session);
      }

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  const detail = await getOrderDetail(userId, createdOrder._id);

  // Send Order Confirmation Email asynchronously
  try {
    const user = await User.findById(userId);
    if (user && user.email) {
      const orderCode = `#${createdOrder._id.toString().slice(-8).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2B6CB0;">Xác nhận đơn hàng ${orderCode}</h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Cảm ơn bạn đã đặt hàng tại <strong>FoodGo</strong>. Đơn hàng của bạn đã được hệ thống ghi nhận thành công!</p>
          <div style="background: #F7FAFC; padding: 14px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Mã đơn hàng:</strong> ${orderCode}</p>
            <p style="margin: 4px 0;"><strong>Phương thức thanh toán:</strong> ${createdOrder.payment_method}</p>
            <p style="margin: 4px 0;"><strong>Tổng tiền:</strong> ${createdOrder.total_amount.toLocaleString()}đ</p>
            <p style="margin: 4px 0;"><strong>Địa chỉ giao hàng:</strong> ${createdOrder.shipping_address || "Tại địa chỉ đã chọn"}</p>
          </div>
          <p style="font-size: 13px; color: #718096;">Bạn có thể theo dõi tiến trình đơn hàng trực tiếp trên ứng dụng FoodGo.</p>
        </div>
      `;
      emailService.sendMail(user.email, `[FoodGo] Xác nhận đơn hàng ${orderCode}`, html);
    }
  } catch (e) {
    console.error("[OrderService] Failed to send order confirmation email:", e.message);
  }

  return detail;
};

const getOrderDetail = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const shopOrders = await ShopOrder.find({ order_id: order._id });
  const shopOrderIds = shopOrders.map((so) => so._id);
  const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });

  const itemIds = items.map((i) => i._id);
  const reviews = await Review.find({ order_item_id: { $in: itemIds } });
  const reviewMap = new Map();
  reviews.forEach((r) => reviewMap.set(r.order_item_id.toString(), r));

  return {
    order,
    shopOrders: shopOrders.map((so) => ({
      ...so.toObject(),
      items: items
        .map((i) => {
          const itemObj = i.toObject();
          itemObj.review = reviewMap.get(i._id.toString()) || null;
          return itemObj;
        })
        .filter((i) => i.shop_order_id.toString() === so._id.toString()),
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
    throw new ApiError(404, "Không tìm thấy đơn hàng");
  }
  if (order.status === "CANCELLED") {
    throw new ApiError(400, "Đơn hàng này đã bị hủy trước đó");
  }

  const shopOrders = await ShopOrder.find({ order_id: order._id });
  const nonCancellable = shopOrders.some(
    (so) => !["PENDING_PAYMENT", "CONFIRMED"].includes(so.status)
  );
  if (nonCancellable) {
    throw new ApiError(400, "Quán ăn đã bắt đầu chuẩn bị hoặc đang giao hàng, không thể hủy đơn vào lúc này");
  }

  const shopOrderIds = shopOrders.map((so) => so._id);
  const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of items) {
        if (order.payment_method === "COD") {
          // COD đã commitStock khi tạo đơn, nên hoàn lại vào stock
          await ProductVariant.findOneAndUpdate(
            { _id: item.variant_id },
            { $inc: { stock: item.quantity } },
            { session }
          );
        } else {
          // VNPAY PENDING_PAYMENT chỉ mới reserve, giải phóng reserved_quantity
          await inventoryService.releaseStock(item.variant_id, item.quantity, session);
        }
      }

      // Giảm used_count của voucher nếu đơn hàng có áp dụng
      if (order.voucher_id) {
        await Voucher.findByIdAndUpdate(
          order.voucher_id,
          { $inc: { used_count: -1 } },
          { session }
        );
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
  if (shopOrder.payment_method === "COD") {
    shopOrder.payment_status = "PAID";
  }
  await shopOrder.save();

  const remainingUnfinished = await ShopOrder.countDocuments({
    order_id: shopOrder.order_id,
    status: { $nin: ["DELIVERED", "COMPLETED", "CANCELLED"] },
  });
  if (remainingUnfinished === 0) {
    await Order.findByIdAndUpdate(shopOrder.order_id, {
      status: "COMPLETED",
      payment_status: "PAID",
    });
  }

  return shopOrder;
};

  /**
 * Tự động hủy các đơn PENDING_PAYMENT quá 24 tiếng mà chưa hoàn tất thanh toán.
 * Idempotent, giải phóng tồn kho đã reserve.
 */
const cancelExpiredUnpaidOrders = async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expiredOrders = await Order.find({
    status: "PENDING_PAYMENT",
    createdAt: { $lte: cutoff },
  });

  if (!expiredOrders.length) return { cancelledCount: 0 };

  let cancelledCount = 0;
  for (const order of expiredOrders) {
    try {
      const shopOrders = await ShopOrder.find({ order_id: order._id });
      const shopOrderIds = shopOrders.map((so) => so._id);
      const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          for (const item of items) {
            await inventoryService.releaseStock(item.variant_id, item.quantity, session);
          }
          if (order.voucher_id) {
            await Voucher.findByIdAndUpdate(
              order.voucher_id,
              { $inc: { used_count: -1 } },
              { session }
            );
          }
          order.status = "CANCELLED";
          await order.save({ session });
          await ShopOrder.updateMany(
            { order_id: order._id },
            { status: "CANCELLED" },
            { session }
          );
        });
        cancelledCount++;
      } finally {
        await session.endSession();
      }
    } catch (err) {
      console.error(`[OrderTimeout] Failed to cancel order ${order._id}:`, err.message);
    }
  }

  if (cancelledCount > 0) {
    console.log(`[OrderTimeout] Auto-cancelled ${cancelledCount} unpaid orders older than 24h.`);
  }
  return { cancelledCount };
};

/**
 * Mua lại đơn: Lấy danh sách các món từ đơn hàng cũ và thêm vào giỏ hàng của Buyer.
 */
const reorder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng");
  }

  const shopOrders = await ShopOrder.find({ order_id: order._id });
  const shopOrderIds = shopOrders.map((so) => so._id);

  const orderItems = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } });
  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(400, "Đơn hàng không có món nào để mua lại");
  }

  let addedCount = 0;
  let skippedCount = 0;

  for (const item of orderItems) {
    try {
      const variant = await ProductVariant.findOne({ _id: item.variant_id, is_active: true });
      if (!variant) {
        skippedCount++;
        continue;
      }
      await cartService.addItem(userId, {
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
      addedCount++;
    } catch {
      skippedCount++;
    }
  }

  if (addedCount === 0) {
    throw new ApiError(400, "Các món trong đơn hàng hiện không còn bán hoặc đã hết hàng");
  }

  return {
    success: true,
    message: `Đã thêm ${addedCount} món vào giỏ hàng${skippedCount > 0 ? ` (${skippedCount} món tạm hết)` : ""}.`,
    addedCount,
    skippedCount,
  };
};

module.exports = {
  checkout,
  getOrderDetail,
  listMyOrders,
  cancelOrder,
  completeShopOrder,
  cancelExpiredUnpaidOrders,
  reorder,
};


