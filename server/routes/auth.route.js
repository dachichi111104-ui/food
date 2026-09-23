const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const { registerRules, loginRules } = require("../validators/auth.validator");

router.post("/register", registerRules, authController.register);
router.post("/login", loginRules, authController.login);
router.get("/me", authenticate, authController.getMe);

module.exports = router;