const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const { createReportRules, resolveReportRules } = require("../validators/report.validator");

// Buyer tạo report
router.post(
  "/",
  authenticate,
  authorize("buyer"),
  createReportRules,
  reportController.createReport
);

// Admin xem/xử lý report
router.get("/", authenticate, authorize("admin"), reportController.listReports);
router.patch(
  "/:id/resolve",
  authenticate,
  authorize("admin"),
  resolveReportRules,
  reportController.resolveReport
);

module.exports = router;