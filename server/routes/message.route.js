const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", messageController.listMessages);
router.post("/", messageController.sendMessage);

module.exports = router;
