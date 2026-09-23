const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

router.get("/", categoryController.listCategories);
router.post("/", authenticate, authorize("admin"), categoryController.createCategory);

module.exports = router;