const { body } = require("express-validator");
const { validate } = require("./_shared");

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["buyer", "seller", "shipper"])
    .withMessage("Invalid role"),
  validate,
];

const loginRules = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

module.exports = { registerRules, loginRules };