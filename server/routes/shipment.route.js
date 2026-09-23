const express = require("express");
const router = express.Router();

const shipmentController = require("../controllers/shipment.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

router.use(authenticate, authorize("shipper"));

router.get("/available", shipmentController.listAvailable);
router.get("/assigned", shipmentController.listMine);
router.patch("/:id/claim", shipmentController.claim);
router.patch("/:id/pickup", shipmentController.confirmPickup);
router.patch("/:id/deliver", shipmentController.markDelivered);

module.exports = router;