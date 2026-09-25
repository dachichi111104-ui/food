const favoriteService = require("../services/favorite.service");

const toggleFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.toggleFavorite(req.user.id, req.params.shopId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const listFavorites = async (req, res, next) => {
  try {
    const shops = await favoriteService.listFavorites(req.user.id);
    res.status(200).json({ shops });
  } catch (err) {
    next(err);
  }
};

const checkIsFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.checkIsFavorite(req.user.id, req.params.shopId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFavorite, listFavorites, checkIsFavorite };
