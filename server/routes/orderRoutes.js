const express = require("express");
const router = express.Router();

// Dev helper: return sample orders with createdAt in 'YYYY-MM-DD, HH:MM:SS' format
function nowFormatted() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}`;
  return `${date}, ${time}`;
}

router.get("/", async (req, res) => {
  res.json([
    {
      id: 1,
      customerName: "Demo Customer",
      items: [{ productName: "Thekua 250g", qty: 2 }],
      total: 240,
      status: "pending",
      createdAt: nowFormatted(),
      invoiceNumber: "INV-0001",
    },
  ]);
});

// Add an order - return error when no database connected
router.post("/", async (req, res) => {
  const incoming = req.body || {};
  const order = {
    id: Date.now(),
    customerName: incoming.customerName || "Guest",
    items: incoming.items || [],
    total: incoming.total || 0,
    status: "pending",
    createdAt: nowFormatted(),
    invoiceNumber: incoming.invoiceNumber || null,
  };
  res.status(201).json(order);
});

// Update order status - return error when no database connected
router.put("/:id/status", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot update orders",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
