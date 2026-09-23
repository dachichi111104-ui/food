const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Food delivery API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;