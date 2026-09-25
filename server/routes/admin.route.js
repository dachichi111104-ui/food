const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const { approveShopRules, categoryRules, refundRules } = require("../validators/admin.validator");

router.use(authenticate, authorize("admin"));

// Dashboard Statistics
router.get("/stats", adminController.getStats);

// Shop approval
router.get("/shops", adminController.listShopsForReview);
router.patch("/shops/:id/approve", approveShopRules, adminController.approveShop);

// Category management
router.patch("/categories/:id", categoryRules, adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// Order monitoring
router.get("/orders", adminController.listAllOrders);

// Refund thủ công
router.patch("/shop-orders/:id/refunding", adminController.markRefunding);
router.patch("/shop-orders/:id/refunded", refundRules, adminController.markRefunded);

module.exports = router;