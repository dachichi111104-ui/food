const { body } = require("express-validator");
const { validate } = require("./_shared");

const createReportRules = [
  body("reason").trim().notEmpty().withMessage("Reason is required"),
  body("shop_order_id").optional().isString(),
  body("description").optional().trim(),
  validate,
];

const resolveReportRules = [
  body("resolution_note").trim().notEmpty().withMessage("Resolution note is required"),
  validate,
];

module.exports = { createReportRules, resolveReportRules };