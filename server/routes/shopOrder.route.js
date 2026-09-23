const express = require("express");
const router = express.Router();

const shopOrderController = require("../controllers/shopOrder.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const { cancelRules } = require("../validators/shopOrder.validator");

router.use(authenticate, authorize("seller"));

router.get("/", shopOrderController.listMyShopOrders);
router.patch("/:id/confirm", shopOrderController.confirmOrder);
router.patch("/:id/prepare", shopOrderController.startPreparing);
router.patch("/:id/hand-to-shipper", shopOrderController.handToShipper);
router.patch("/:id/cancel", cancelRules, shopOrderController.cancelByShop);


module.exports = router;