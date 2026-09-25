const ShipperReview = require("../models/ShipperReview.model");
const Shipment = require("../models/Shipment.model");
const ShopOrder = require("../models/ShopOrder.model");

const ApiError = require("../utils/ApiError");

const createShipperReview = async (userId, { shop_order_id, rating, comment }) => {
  const shopOrder = await ShopOrder.findById(shop_order_id);
  if (!shopOrder) {
    throw new ApiError(404, "Không tìm thấy đơn hàng");
  }

  const shipment = await Shipment.findOne({ shop_order_id });
  if (!shipment || !shipment.shipper_id) {
    throw new ApiError(400, "Đơn hàng này chưa có tài xế Shipper phụ trách");
  }

  const existing = await ShipperReview.findOne({ shop_order_id, user_id: userId });
  if (existing) {
    throw new ApiError(409, "Bạn đã gửi đánh giá cho Tài xế Shipper đơn này rồi");
  }

  const review = await ShipperReview.create({
    user_id: userId,
    shipper_id: shipment.shipper_id,
    shop_order_id,
    rating,
    comment,
  });

  return review;
};

const getShipperReviewByShopOrder = async (shop_order_id) => {
  const review = await ShipperReview.findOne({ shop_order_id });
  return review;
};

module.exports = { createShipperReview, getShipperReviewByShopOrder };
