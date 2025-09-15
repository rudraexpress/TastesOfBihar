const express = require("express");
const router = express.Router();

// Get all users - return empty array when no database connected
router.get("/", async (req, res) => {
  res.json([]);
});

// Register user - return error when no database connected
router.post("/register", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot register users",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
