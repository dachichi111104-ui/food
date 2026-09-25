const express = require("express");
const router = express.Router();

const bannerController = require("../controllers/banner.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const upload = require("../middlewares/upload.middleware");

// Public
router.get("/public", bannerController.listPublicBanners);

// Admin only
router.get("/", authenticate, authorize("admin"), bannerController.listAllBanners);
router.post("/", authenticate, authorize("admin"), upload.single("image"), bannerController.createBanner);
router.patch("/:id", authenticate, authorize("admin"), upload.single("image"), bannerController.updateBanner);
router.delete("/:id", authenticate, authorize("admin"), bannerController.deleteBanner);

module.exports = router;
