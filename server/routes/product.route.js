const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const checkShopOwnership = require("../middlewares/checkShopOwnership.middleware");
const upload = require("../middlewares/upload.middleware");
const { createProductRules } = require("../validators/product.validator");

// Public
router.get("/", productController.listPublicProducts);
router.get("/:id", productController.getPublicProductDetail);

// Seller
router.get(
  "/me/own",
  authenticate,
  authorize("seller"),
  checkShopOwnership,
  productController.getMyShopProducts
);
router.post(
  "/",
  authenticate,
  authorize("seller"),
  checkShopOwnership,
  upload.single("image"),
  createProductRules,
  productController.createProduct
);
router.patch(
  "/:id",
  authenticate,
  authorize("seller"),
  checkShopOwnership,
  upload.single("image"),
  productController.updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("seller"),
  checkShopOwnership,
  productController.deleteProduct
);

module.exports = router;