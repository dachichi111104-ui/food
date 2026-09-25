const express = require("express");
const router = express.Router();

const voucherController = require("../controllers/voucher.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

// Public
router.get("/public", voucherController.listPublicVouchers);
router.post("/apply", voucherController.applyVoucher);

// Admin only
router.get("/", authenticate, authorize("admin"), voucherController.listAllVouchers);
router.post("/", authenticate, authorize("admin"), voucherController.createVoucher);
router.delete("/:id", authenticate, authorize("admin"), voucherController.deleteVoucher);

module.exports = router;
