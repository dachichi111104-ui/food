const { body, query } = require("express-validator");
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

const forgotPasswordRules = [
  body("email").isEmail().withMessage("Vui lòng nhập địa chỉ email hợp lệ").normalizeEmail(),
  validate,
];

const resetPasswordRules = [
  body("token").notEmpty().withMessage("Mã token đặt lại mật khẩu là bắt buộc"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu mới phải có ít nhất 6 ký tự"),
  validate,
];

const googleAuthRules = [
  body("id_token").notEmpty().withMessage("id_token từ Google là bắt buộc"),
  validate,
];

module.exports = {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  googleAuthRules,
};