const { body } = require("express-validator");
const { validate } = require("./_shared");

const cancelRules = [
  body("reason").trim().notEmpty().withMessage("Cancel reason is required"),
  validate,
];

module.exports = { cancelRules };