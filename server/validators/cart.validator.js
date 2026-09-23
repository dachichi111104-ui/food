const { body } = require("express-validator");
const { validate } = require("./_shared");

const addItemRules = [
  body("variant_id").notEmpty().withMessage("variant_id is required"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
  validate,
];

const updateItemRules = [
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
  validate,
];

module.exports = { addItemRules, updateItemRules };