const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const { createReviewRules } = require("../validators/review.validator");

// Public: ai cũng xem được review của 1 sản phẩm
router.get("/product/:productId", reviewController.listReviewsByProduct);

// Buyer tạo review
router.post(
  "/",
  authenticate,
  authorize("buyer"),
  createReviewRules,
  reviewController.createReview
);

module.exports = router;