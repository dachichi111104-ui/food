const express = require("express");
const router = express.Router();

const addressController = require("../controllers/address.controller");
const authenticate = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", addressController.listAddresses);
router.post("/", addressController.createAddress);
router.patch("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.patch("/:id/default", addressController.setDefaultAddress);

module.exports = router;
