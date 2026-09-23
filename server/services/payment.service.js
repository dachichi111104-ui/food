const mongoose = require("mongoose");
const { Order, ShopOrder, OrderItem, PaymentTransaction } = require("../models");
const vnpayService = require("./vnpay.service");
const inventoryService = require("./inventory.service");
const ApiError = require("../utils/ApiError");

const createPayment = async (userId, orderId, ipAddr) => {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status !== "PENDING_PAYMENT") {
    throw new ApiError(400, "Order is not pending payment");
  }

  // txnRef phải unique - dùng orderId + timestamp để tránh trùng nếu Buyer bấm thanh toán lại
  const txnRef = `${order._id}_${Date.now()}`;

  await PaymentTransaction.create({
    order_id: order._id,
    method: "VNPAY",
    amount: order.total_amount,
    status: "PENDING",
    gateway_transaction_ref: txnRef,
  });

  const paymentUrl = vnpayService.buildPaymentUrl({
    orderId: order._id.toString(),
    amount: order.total_amount,
    txnRef,
    ipAddr: ipAddr || "127.0.0.1",
  });

  return { paymentUrl };
};

/**
 * Xử lý khi VNPay redirect Buyer về return URL.
 * Idempotent: nếu PaymentTransaction đã SUCCESS/FAILED rồi thì không xử lý lại.
 */
const handleReturn = async (query) => {
  const isValidSignature = vnpayService.verifyReturnUrl(query);
  if (!isValidSignature) {
    throw new ApiError(400, "Invalid signature");
  }

  const txnRef = query.vnp_TxnRef;
  const responseCode = query.vnp_ResponseCode;

  const transaction = await PaymentTransaction.findOne({ gateway_transaction_ref: txnRef });
  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  // Idempotency guard: đã xử lý rồi thì trả kết quả cũ, không làm lại
  if (transaction.status !== "PENDING") {
    return {
      status: transaction.status,
      order_id: transaction.order_id,
    };
  }

  const order = await Order.findById(transaction.order_id);

  if (responseCode === "00") {
    // THÀNH CÔNG
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        transaction.status = "SUCCESS";
        transaction.raw_response = query;
        await transaction.save({ session });

        order.status = "PAID";
        await order.save({ session });

        const shopOrders = await ShopOrder.find({ order_id: order._id }).session(session);
        const shopOrderIds = shopOrders.map((so) => so._id);
        const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } }).session(
          session
        );

        // Commit tồn kho thật (trừ stock, giảm reserved_quantity)
        for (const item of items) {
          await inventoryService.commitStock(item.variant_id, item.quantity, session);
        }

        // ShopOrder chuyển từ PENDING_PAYMENT -> CONFIRMED
        await ShopOrder.updateMany(
          { order_id: order._id },
          { status: "CONFIRMED" },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return { status: "SUCCESS", order_id: order._id };
  } else {
    // THẤT BẠI
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        transaction.status = "FAILED";
        transaction.raw_response = query;
        await transaction.save({ session });

        order.status = "CANCELLED";
        await order.save({ session });

        const shopOrders = await ShopOrder.find({ order_id: order._id }).session(session);
        const shopOrderIds = shopOrders.map((so) => so._id);
        const items = await OrderItem.find({ shop_order_id: { $in: shopOrderIds } }).session(
          session
        );

        // Giải phóng reserved_quantity vì thanh toán thất bại
        for (const item of items) {
          await inventoryService.releaseStock(item.variant_id, item.quantity, session);
        }

        await ShopOrder.updateMany(
          { order_id: order._id },
          { status: "CANCELLED" },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return { status: "FAILED", order_id: order._id };
  }
};

module.exports = { createPayment, handleReturn };