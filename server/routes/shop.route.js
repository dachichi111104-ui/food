const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const upload = require("../middlewares/upload.middleware");
const { createShopRules } = require("../validators/shop.validator");

// Public
router.get("/", shopController.listPublicShops);
router.get("/:id", shopController.getPublicShop);

// Seller
router.post(
  "/",
  authenticate,
  authorize("seller"),
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "cover", maxCount: 1 }]),
  createShopRules,
  shopController.createShop
);
router.get(
  "/me/own",
  authenticate,
  authorize("seller"),
  shopController.getMyShop
);
router.get(
  "/me/list",
  authenticate,
  authorize("seller"),
  shopController.getMyShops
);
router.patch(
  "/me/own",
  authenticate,
  authorize("seller"),
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "cover", maxCount: 1 }]),
  shopController.updateMyShop
);

module.exports = router;