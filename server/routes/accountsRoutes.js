const express = require("express");
const router = express.Router();

// Return zeros for accounts data when no database connected
router.get("/expenses", async (req, res) => {
  res.json([]);
});

router.get("/profit-loss", async (req, res) => {
  res.json({
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    grossMargin: 0,
    netMargin: 0,
  });
});

router.use((req, res) => {
  res.status(503).json({
    message: "Database not connected - accounts service unavailable",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
