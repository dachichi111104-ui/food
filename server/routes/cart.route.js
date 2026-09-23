const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const { addItemRules, updateItemRules } = require("../validators/cart.validator");

router.use(authenticate, authorize("buyer"));

router.get("/", cartController.getCart);
router.post("/items", addItemRules, cartController.addItem);
router.patch("/items/:id", updateItemRules, cartController.updateItem);
router.delete("/items/:id", cartController.removeItem);
router.get("/checkout-preview", cartController.previewCheckout);

module.exports = router;