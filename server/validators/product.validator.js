const { body } = require("express-validator");
const { validate } = require("./_shared");

const createProductRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("category_id").notEmpty().withMessage("Category is required"),
  body("description").optional().trim(),
  body("variants")
    .custom((value) => {
      let parsed;
      try {
        parsed = typeof value === "string" ? JSON.parse(value) : value;
      } catch {
        throw new Error("variants must be valid JSON");
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("At least one variant is required");
      }
      for (const v of parsed) {
        if (!v.name || v.price == null || v.stock == null) {
          throw new Error("Each variant needs name, price, stock");
        }
      }
      return true;
    }),
  validate,
];

module.exports = { createProductRules };