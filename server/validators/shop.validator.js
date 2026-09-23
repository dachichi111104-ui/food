const { body } = require("express-validator");
const { validate } = require("./_shared");

const createShopRules = [
  body("name").trim().notEmpty().withMessage("Shop name is required"),
  body("description").optional().trim(),
  body("address").optional().trim(),
  validate,
];

module.exports = { createShopRules };