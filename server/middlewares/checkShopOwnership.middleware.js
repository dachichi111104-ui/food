const { Shop } = require("../models");
const ApiError = require("../utils/ApiError");

// Gắn req.shop nếu Seller đang thao tác đúng shop của mình
const checkShopOwnership = async (req, res, next) => {
  try {
    const shopId = req.query.shop_id || req.headers["x-shop-id"] || req.body?.shop_id;
    const filter = { user_id: req.user.id };
    if (shopId) {
      filter._id = shopId;
    }
    let shop = await Shop.findOne(filter);
    if (!shop && !shopId) {
      // Ưu tiên chọn quán đã duyệt nếu có nhiều quán
      shop = await Shop.findOne({ user_id: req.user.id, status: "approved" });
    }
    if (!shop) {
      return next(new ApiError(404, "You don't have a shop yet"));
    }
    req.shop = shop;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = checkShopOwnership;