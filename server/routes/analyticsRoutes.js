const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

function parseDate(str, fallback) {
  const d = new Date(str);
  return isNaN(d.getTime()) ? fallback : d;
}

// Summary aggregate
router.get("/summary", async (req, res) => {
  const { from, to } = req.query;
  const end = parseDate(to, new Date());
  const start = parseDate(from, new Date(Date.now() - 13 * 86400000));

  const orders = await Order.findAll({
    where: {},
  });

  // Filter in memory by date range (for small dataset). In production, push to DB query.
  const ranged = orders.filter((o) => {
    const ts = new Date(o.createdAt).getTime();
    return ts >= start.getTime() && ts <= end.getTime();
  });

  const products = await Product.findAll();
  const totalRevenue = ranged.reduce((a, o) => a + (o.total || 0), 0);
  const totalOrders = ranged.length;
  const delivered = ranged.filter((o) => o.status === "delivered").length;
  const pending = ranged.filter((o) => o.status === "pending").length;
  const shipped = ranged.filter((o) => o.status === "shipped").length;
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
  const productCount = products.length;

  // revenue growth vs previous equal window
  const windowMs = end.getTime() - start.getTime() || 1;
  const prevStart = new Date(start.getTime() - windowMs);
  const prevEnd = new Date(start.getTime() - 1);
  const prev = orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= prevStart.getTime() && t <= prevEnd.getTime();
  });
  const prevRevenue = prev.reduce((a, o) => a + (o.total || 0), 0);
  const revenueGrowth = prevRevenue
    ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
    : 0;

  res.json({
    from: start.toISOString(),
    to: end.toISOString(),
    totalRevenue,
    totalOrders,
    delivered,
    pending,
    shipped,
    avgOrder,
    productCount,
    revenueGrowth,
  });
});

// Daily revenue & orders time series
router.get("/daily", async (req, res) => {
  const { from, to } = req.query;
  const end = parseDate(to, new Date());
  const start = parseDate(from, new Date(Date.now() - 13 * 86400000));
  const orders = await Order.findAll();
  const byDay = {};
  for (
    let d = new Date(start);
    d <= end;
    d = new Date(d.getTime() + 86400000)
  ) {
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { date: key, revenue: 0, orders: 0 };
  }
  orders.forEach((o) => {
    const ts = new Date(o.createdAt);
    if (ts >= start && ts <= end) {
      const key = ts.toISOString().slice(0, 10);
      if (!byDay[key]) byDay[key] = { date: key, revenue: 0, orders: 0 };
      byDay[key].revenue += o.total || 0;
      byDay[key].orders += 1;
    }
  });
  res.json(Object.values(byDay).sort((a, b) => (a.date < b.date ? -1 : 1)));
});

// Status distribution for chart
router.get("/status-distribution", async (req, res) => {
  const { from, to } = req.query;
  const end = parseDate(to, new Date());
  const start = parseDate(from, new Date(Date.now() - 13 * 86400000));
  const orders = await Order.findAll();
  const ranged = orders.filter((o) => {
    const ts = new Date(o.createdAt).getTime();
    return ts >= start.getTime() && ts <= end.getTime();
  });
  const dist = { pending: 0, shipped: 0, delivered: 0 };
  ranged.forEach((o) => {
    if (dist[o.status] !== undefined) dist[o.status] += 1;
  });
  res.json(dist);
});

// Top customers by revenue
router.get("/top-customers", async (req, res) => {
  const { limit = 5, from, to } = req.query;
  const end = parseDate(to, new Date());
  const start = parseDate(from, new Date(Date.now() - 29 * 86400000));
  const orders = await Order.findAll();
  const agg = {};
  orders.forEach((o) => {
    const ts = new Date(o.createdAt).getTime();
    if (ts < start.getTime() || ts > end.getTime()) return;
    const key = o.customerName || "Unknown";
    if (!agg[key]) agg[key] = { customerName: key, total: 0, orders: 0 };
    agg[key].total += o.total || 0;
    agg[key].orders += 1;
  });
  const list = Object.values(agg)
    .sort((a, b) => b.total - a.total)
    .slice(0, parseInt(limit, 10));
  res.json(list);
});

// Low inventory products
router.get("/inventory-low", async (req, res) => {
  const { threshold = 10 } = req.query;
  const products = await Product.findAll();
  const t = parseInt(threshold, 10);
  const low = products
    .filter((p) => (p.stock || 0) <= t)
    .map((p) => ({ id: p.id, name: p.name, stock: p.stock || 0 }))
    .sort((a, b) => a.stock - b.stock);
  res.json(low);
});

module.exports = router;
