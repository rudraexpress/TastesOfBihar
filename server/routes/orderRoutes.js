const express = require("express");
const router = express.Router();

// Get all orders - return empty array when no database connected
router.get("/", async (req, res) => {
  res.json([]);
});

// Add an order - return error when no database connected
router.post("/", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot create orders",
    error: "SERVICE_UNAVAILABLE",
  });
});

// Update order status - return error when no database connected
router.put("/:id/status", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot update orders",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
