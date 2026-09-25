const { Favorite, Shop } = require("../models");

const toggleFavorite = async (userId, shopId) => {
  const existing = await Favorite.findOne({ user_id: userId, shop_id: shopId });
  if (existing) {
    await Favorite.deleteOne({ _id: existing._id });
    return { isFavorite: false, message: "Đã xóa khỏi danh sách yêu thích" };
  } else {
    await Favorite.create({ user_id: userId, shop_id: shopId });
    return { isFavorite: true, message: "Đã thêm vào danh sách yêu thích" };
  }
};

const listFavorites = async (userId) => {
  const favorites = await Favorite.find({ user_id: userId }).populate("shop_id").sort({ createdAt: -1 });
  return favorites.map((f) => f.shop_id).filter(Boolean);
};

const checkIsFavorite = async (userId, shopId) => {
  const existing = await Favorite.findOne({ user_id: userId, shop_id: shopId });
  return { isFavorite: Boolean(existing) };
};

module.exports = { toggleFavorite, listFavorites, checkIsFavorite };
