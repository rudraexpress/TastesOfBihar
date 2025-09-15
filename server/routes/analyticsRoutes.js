const express = require("express");
const router = express.Router();

router.get("/summary", async (req, res) => {
  res.json({
    totalRevenue: 0,
    totalOrders: 0,
    delivered: 0,
    pending: 0,
    shipped: 0,
    avgOrder: 0,
    productCount: 0,
    revenueGrowth: 0,
  });
});

router.get("/daily", async (req, res) => {
  res.json([]);
});

router.get("/status-distribution", async (req, res) => {
  res.json({
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
});

router.get("/top-customers", async (req, res) => {
  res.json([]);
});

router.get("/inventory-low", async (req, res) => {
  res.json([]);
});

module.exports = router;
