const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

router.post(
  "/create",
  authenticate,
  authorize("buyer"),
  paymentController.createPayment
);

// return URL: VNPay gọi trực tiếp (redirect trình duyệt Buyer), không có JWT
router.get("/vnpay/return", paymentController.handleReturn);

module.exports = router;