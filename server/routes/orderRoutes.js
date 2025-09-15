const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Get all orders (optional status filter)
router.get("/", async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : undefined;
  const orders = await Order.findAll({ where, order: [["createdAt", "DESC"]] });
  res.json(orders);
});

// Add an order
router.post("/", async (req, res) => {
  const { customerName, total, status } = req.body;
  const order = await Order.create({ customerName, total, status });
  res.json(order);
});

// Update order status
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await Order.findByPk(id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.status = status;
  await order.save();
  res.json(order);
});

module.exports = router;
