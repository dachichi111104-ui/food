const express = require("express");
const router = express.Router();

const chatbotController = require("../controllers/chatbot.controller");
const jwt = require("jsonwebtoken");

// Soft auth middleware so both guests and logged in users can use chatbot
const softAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme_in_dev");
      req.user = decoded;
    } catch {
      req.user = null;
    }
  }
  next();
};

router.post("/message", softAuth, chatbotController.chat);

module.exports = router;
