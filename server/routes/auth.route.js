const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  googleAuthRules,
} = require("../validators/auth.validator");

router.post("/register", registerRules, authController.register);
router.post("/login", loginRules, authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", forgotPasswordRules, authController.forgotPassword);
router.post("/reset-password", resetPasswordRules, authController.resetPassword);
router.post("/google", googleAuthRules, authController.googleLogin);

router.get("/me", authenticate, authController.getMe);
router.patch("/me", authenticate, upload.single("avatar"), authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);

module.exports = router;