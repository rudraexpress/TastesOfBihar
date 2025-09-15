const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json([]);
});

router.get("/monthly", async (req, res) => {
  res.json([]);
});

router.get("/daily", async (req, res) => {
  res.json([]);
});

router.get("/summary", async (req, res) => {
  res.json({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
  });
});

router.use((req, res) => {
  res.status(503).json({
    message: "Database not connected - sales service unavailable",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
