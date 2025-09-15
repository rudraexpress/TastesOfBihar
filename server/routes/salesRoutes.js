const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product");

// GET /api/sales  (optional query: productId)
router.get("/", async (req, res) => {
  const { productId } = req.query;
  const where = productId ? { productId } : undefined;
  const list = await Sale.findAll({ where, order: [["createdAt", "DESC"]] });
  res.json(list);
});

// POST /api/sales  body: { customerName, invoiceNumber, productId?, quantity, unit, total, gstRate, notes }
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      invoiceNumber,
      productId,
      quantity,
      unit,
      total,
      gstRate,
      notes,
    } = req.body;
    const gross = parseFloat(total || 0);
    if (!gross || gross <= 0)
      return res.status(400).json({ message: "Invalid total" });
    const rate = parseFloat(gstRate || 0);
    const baseAmount = rate ? gross / (1 + rate / 100) : gross;
    const gst = gross - baseAmount;

    // Optional product existence check
    if (productId) {
      const prod = await Product.findByPk(productId);
      if (!prod)
        return res.status(400).json({ message: "Invalid product reference" });
    }

    const sale = await Sale.create({
      customerName,
      invoiceNumber,
      productId: productId || null,
      quantity: quantity ? parseFloat(quantity) : 1,
      unit,
      total: gross,
      baseAmount,
      gst,
      gstRate: rate,
      notes,
    });
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sale create failed" });
  }
});

// Simple aggregation: /api/sales/summary?year=2025
router.get("/summary", async (req, res) => {
  try {
    const { start, end } = req.query; // ISO date range optional
    const where = {};
    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt[require("sequelize").Op.gte] = new Date(start);
      if (end) where.createdAt[require("sequelize").Op.lte] = new Date(end);
    }
    const rows = await Sale.findAll({ where });
    const totals = rows.reduce(
      (acc, r) => {
        acc.count += 1;
        acc.gross += r.total;
        acc.gst += r.gst;
        acc.base += r.baseAmount;
        return acc;
      },
      { count: 0, gross: 0, gst: 0, base: 0 }
    );
    res.json(totals);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Summary failed" });
  }
});

module.exports = router;
