const { Shop } = require("../models");
const ApiError = require("../utils/ApiError");

// Gắn req.shop nếu Seller đang thao tác đúng shop của mình
const checkShopOwnership = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ user_id: req.user.id });
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