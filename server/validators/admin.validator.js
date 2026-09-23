const { body } = require("express-validator");
const { validate } = require("./_shared");

const approveShopRules = [
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("status must be approved or rejected"),
  validate,
];

const refundRules = [
  body("note").trim().notEmpty().withMessage("Refund note is required"),
];
refundRules.push(validate);

const categoryRules = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  validate,
];

module.exports = { approveShopRules, refundRules, categoryRules };