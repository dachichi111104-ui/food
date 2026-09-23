const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

router.use(authenticate, authorize("buyer"));

router.post("/checkout", orderController.checkout);
router.get("/", orderController.listMyOrders);
router.get("/:id", orderController.getOrderDetail);
router.patch("/:id/cancel", orderController.cancelOrder);
router.patch("/shop-orders/:shopOrderId/complete", orderController.completeShopOrder);

module.exports = router;