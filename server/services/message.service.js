const Message = require("../models/Message.model");
const User = require("../models/User.model");
const ShopOrder = require("../models/ShopOrder.model");
const Order = require("../models/Order.model");
const Shipment = require("../models/Shipment.model");
const Shop = require("../models/Shop.model");
const ApiError = require("../utils/ApiError");

/**
 * Validate user membership in an order and verify channel permission based on order status
 */
async function validateOrderChatPermission(userId, userRole, orderId, targetRole, action = "send") {
  if (!orderId) {
    if (userRole === "admin" || targetRole === "admin") return null;
    throw new ApiError(400, "Vui lòng chọn đơn hàng để trò chuyện.");
  }

  // Find shop order
  let shopOrder = await ShopOrder.findById(orderId).populate("shop_id");
  let parentOrder = null;

  if (shopOrder) {
    parentOrder = await Order.findById(shopOrder.order_id);
  } else {
    // Check if orderId is parent Order ID
    parentOrder = await Order.findById(orderId);
    if (parentOrder) {
      shopOrder = await ShopOrder.findOne({ order_id: parentOrder._id }).populate("shop_id");
    }
  }

  if (!shopOrder && !parentOrder) {
    throw new ApiError(404, "Không tìm thấy thông tin đơn hàng.");
  }

  const actualOrderId = shopOrder ? shopOrder._id : parentOrder._id;
  const buyerId = parentOrder ? parentOrder.user_id?.toString() : null;
  const sellerOwnerId = shopOrder?.shop_id?.owner_id?.toString();

  // Find shipment to check assigned shipper
  const shipment = shopOrder ? await Shipment.findOne({ shop_order_id: shopOrder._id }) : null;
  const shipperId = shipment?.shipper_id?.toString();

  // 1. Security Check: Ownership & Role relationship
  if (userRole === "admin") {
    // Admin has access to support any order
  } else if (userRole === "buyer") {
    if (buyerId && buyerId !== userId.toString()) {
      throw new ApiError(403, "Bạn không có quyền truy cập cuộc trò chuyện của đơn hàng này.");
    }
  } else if (userRole === "seller") {
    if (sellerOwnerId && sellerOwnerId !== userId.toString()) {
      throw new ApiError(403, "Bạn không phải chủ quán của đơn hàng này.");
    }
  } else if (userRole === "shipper") {
    if (shipperId && shipperId !== userId.toString()) {
      throw new ApiError(403, "Bạn không phải là Shipper phụ trách đơn hàng này.");
    }
  } else {
    throw new ApiError(403, "Vai trò của bạn không được phép tham gia nhắn tin.");
  }

  const orderStatus = shopOrder ? shopOrder.status : parentOrder?.status;

  // 2. Action Check: Cannot send new messages on closed/cancelled orders
  if (action === "send") {
    if (["COMPLETED", "CANCELLED", "REFUNDED", "DELIVERED"].includes(orderStatus)) {
      throw new ApiError(400, "Đơn hàng đã kết thúc hoặc bị hủy. Cuộc trò chuyện chỉ có thể xem lại lịch sử.");
    }

    // 3. Channel Pairing Availability by Order State
    if (targetRole === "shipper" || userRole === "shipper") {
      if (!shipperId && userRole !== "admin") {
        throw new ApiError(400, "Đơn hàng chưa được phân công Shipper, chưa thể nhắn với Shipper.");
      }
    }
  }

  return {
    shopOrder,
    parentOrder,
    shipment,
    orderStatus,
    actualOrderId,
    shopName: shopOrder?.shop_id?.name || "",
  };
}

const sendMessage = async (senderId, payload) => {
  const sender = await User.findById(senderId);
  if (!sender) throw new ApiError(404, "Không tìm thấy thông tin người gửi.");

  const { target_role, text, order_id, order_code } = payload;
  if (!text || !text.trim()) throw new ApiError(400, "Nội dung tin nhắn không được để trống.");

  const perm = await validateOrderChatPermission(senderId, sender.role, order_id, target_role, "send");

  const message = await Message.create({
    sender_id: senderId,
    sender_name: sender.name,
    sender_role: sender.role,
    target_role,
    order_id: perm?.actualOrderId || order_id || null,
    order_code: order_code || (perm?.actualOrderId ? `#${perm.actualOrderId.toString().slice(-6).toUpperCase()}` : ""),
    shop_id: perm?.shopOrder?.shop_id?._id || null,
    shop_name: perm?.shopName || payload.shop_name || "",
    text: text.trim(),
  });

  return message;
};

const listMessages = async (userId, userRole, query = {}) => {
  const { target_role, order_id, limit = 100 } = query;

  if (order_id) {
    await validateOrderChatPermission(userId, userRole, order_id, target_role, "view");
  }

  const filter = {};

  if (order_id) {
    filter.order_id = order_id;

    // Filter pairwise conversation based on roles
    if (userRole === "buyer" && target_role === "seller") {
      filter.$or = [
        { sender_role: "buyer", target_role: "seller" },
        { sender_role: "seller", target_role: "buyer" },
        { sender_role: "admin" },
        { target_role: "admin" },
      ];
    } else if (userRole === "buyer" && target_role === "shipper") {
      filter.$or = [
        { sender_role: "buyer", target_role: "shipper" },
        { sender_role: "shipper", target_role: "buyer" },
        { sender_role: "admin" },
        { target_role: "admin" },
      ];
    } else if (userRole === "seller" && target_role === "buyer") {
      filter.$or = [
        { sender_role: "seller", target_role: "buyer" },
        { sender_role: "buyer", target_role: "seller" },
        { sender_role: "admin" },
        { target_role: "admin" },
      ];
    } else if (userRole === "seller" && target_role === "shipper") {
      filter.$or = [
        { sender_role: "seller", target_role: "shipper" },
        { sender_role: "shipper", target_role: "seller" },
        { sender_role: "admin" },
        { target_role: "admin" },
      ];
    } else if (userRole === "shipper" && target_role === "buyer") {
      filter.$or = [
        { sender_role: "shipper", target_role: "buyer" },
        { sender_role: "buyer", target_role: "shipper" },
        { sender_role: "admin" },
        { target_role: "admin" },
      ];
    } else if (userRole === "shipper" && target_role === "seller") {
      filter.$or = [
        { sender_role: "shipper", target_role: "seller" },
        { sender_role: "seller", target_role: "shipper" },
        { sender_role: "admin" },
        { target_role: "admin" },
      ];
    }
  } else if (target_role) {
    filter.target_role = target_role;
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: 1 })
    .limit(Number(limit));

  return messages;
};

module.exports = { sendMessage, listMessages };

