const express = require("express");
const router = express.Router();

const favoriteController = require("../controllers/favorite.controller");
const authenticate = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", favoriteController.listFavorites);
router.post("/toggle/:shopId", favoriteController.toggleFavorite);
router.get("/check/:shopId", favoriteController.checkIsFavorite);

module.exports = router;
