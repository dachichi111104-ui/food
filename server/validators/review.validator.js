const { body } = require("express-validator");
const { validate } = require("./_shared");

const createReviewRules = [
  body("order_item_id").notEmpty().withMessage("order_item_id is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("rating must be 1-5"),
  body("comment").optional().trim(),
  validate,
];

module.exports = { createReviewRules };