const express = require("express");
const router = express.Router();

router.get("/materials", async (req, res) => {
  res.json([]);
});

router.get("/raw-materials", async (req, res) => {
  res.json([]);
});

router.get("/products", async (req, res) => {
  res.json([]);
});

router.get("/transactions", async (req, res) => {
  res.json([]);
});

router.get("/purchases", async (req, res) => {
  res.json([]);
});

router.use((req, res) => {
  res.status(503).json({
    message: "Database not connected - inventory service unavailable",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
