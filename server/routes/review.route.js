const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const { createReviewRules } = require("../validators/review.validator");

// Public: ai cũng xem được review của 1 sản phẩm
router.get("/product/:productId", reviewController.listReviewsByProduct);
router.get("/shipper/:shopOrderId", reviewController.getShipperReviewByShopOrder);

// Buyer tạo review món ăn / quán
router.post(
  "/",
  authenticate,
  authorize("buyer"),
  createReviewRules,
  reviewController.createReview
);

// Buyer tạo review cho Shipper
router.post(
  "/shipper",
  authenticate,
  authorize("buyer"),
  reviewController.createShipperReview
);

module.exports = router;