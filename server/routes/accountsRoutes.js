const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const RawMaterial = require("../models/RawMaterial");
const Purchase = require("../models/Purchase");
const Expense = require("../models/Expense");
const InventoryTransaction = require("../models/InventoryTransaction");
const Sale = require("../models/Sale");
const { Op } = require("sequelize");

// uploads directory for invoices
const invoicesDir = path.join(__dirname, "..", "..", "assets", "invoices");
if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, invoicesDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".dat";
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

function toGrams(value, unit) {
  const v = parseFloat(value || 0);
  if (unit === "kg") return v * 1000;
  if (unit === "g") return v;
  if (unit === "l") return v * 1000;
  if (unit === "ml") return v;
  if (unit === "pcs") return v; // direct count
  return v;
}

function computeTaxes(baseAmount, sgstRate, cgstRate, igstRate) {
  const base = parseFloat(baseAmount || 0);
  const sgst = base * (parseFloat(sgstRate || 0) / 100);
  const cgst = base * (parseFloat(cgstRate || 0) / 100);
  const igst = base * (parseFloat(igstRate || 0) / 100);
  return {
    baseAmount: base,
    sgst,
    cgst,
    igst,
    total: base + sgst + cgst + igst,
  };
}

// Purchases list
router.get("/purchases", async (req, res) => {
  const list = await Purchase.findAll({ order: [["createdAt", "DESC"]] });
  res.json(list);
});

// Summary: aggregates purchases (input GST), expenses (input GST), and sales (output GST)
router.get("/summary", async (req, res) => {
  try {
    const purchases = await Purchase.findAll();
    const expenses = await Expense.findAll();
    const sales = await Sale.findAll();

    const sum = (rows, field) =>
      rows.reduce((a, r) => a + (parseFloat(r[field] || 0) || 0), 0);

    const purchasesTotal = sum(purchases, "price");
    const purchasesBase = sum(purchases, "baseAmount");
    const purchasesGst = sum(purchases, "gst");

    const expensesTotal = sum(expenses, "amount");
    const expensesBase = sum(expenses, "baseAmount");
    // expenses may store sgst/cgst/igst; prefer gst if present
    const expensesGst =
      sum(expenses, "gst") ||
      sum(expenses, "sgst") + sum(expenses, "cgst") + sum(expenses, "igst");

    const salesTotal = sum(sales, "total");
    const salesBase = sum(sales, "baseAmount");
    const salesGst = sum(sales, "gst");

    const inputGst = purchasesGst + expensesGst;
    const outputGst = salesGst;
    const netGstPayable = outputGst - inputGst;

    res.json({
      purchases: {
        total: purchasesTotal,
        base: purchasesBase,
        gst: purchasesGst,
      },
      expenses: { total: expensesTotal, base: expensesBase, gst: expensesGst },
      sales: { total: salesTotal, base: salesBase, gst: salesGst },
      inputGst,
      outputGst,
      netGstPayable,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Summary failed" });
  }
});

// Balance sheet style snapshot (light): inventory value & GST position.
// GET /api/accounts/balance-sheet  (optional ?start=ISO&end=ISO to limit GST calcs to period; inventory is current)
// Note: Inventory value already reflects any wastage adjustments because those reduce raw material quantities.
router.get("/balance-sheet", async (req, res) => {
  try {
    const { start, end } = req.query;
    let appliedStart = start ? new Date(start) : null;
    let appliedEnd = end ? new Date(end) : null;

    // If no explicit range given, default to current financial year (India): 1 Apr YYYY to 31 Mar YYYY+1
    if (!appliedStart || !appliedEnd) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // 0=Jan
      if (month >= 3) {
        // Current FY started this calendar year
        appliedStart = new Date(year, 3, 1, 0, 0, 0, 0); // Apr 1
        appliedEnd = new Date(year + 1, 2, 31, 23, 59, 59, 999); // Mar 31 next year
      } else {
        // We are in Jan/Feb/Mar: FY started last year Apr 1
        appliedStart = new Date(year - 1, 3, 1, 0, 0, 0, 0);
        appliedEnd = new Date(year, 2, 31, 23, 59, 59, 999);
      }
    }
    const range = {
      createdAt: {
        [Op.gte]: appliedStart,
        [Op.lte]: appliedEnd,
      },
    };

    // Current inventory valuation (raw materials only for now)
    const materials = await RawMaterial.findAll();
    const inventoryValue = materials.reduce(
      (sum, m) => sum + (m.quantityGrams || 0) * (m.avgCostPerGram || 0),
      0
    );

    const where = range; // always defined now for period filtering of flows
    const [purchases, expenses, sales] = await Promise.all([
      Purchase.findAll({ where }),
      Expense.findAll({ where }),
      Sale.findAll({ where }),
    ]);

    const sum = (rows, field) =>
      rows.reduce((a, r) => a + (parseFloat(r[field] || 0) || 0), 0);
    const purchasesBase = sum(purchases, "baseAmount");
    const purchasesGst = sum(purchases, "gst");
    const salesBase = sum(sales, "baseAmount");
    const salesGst = sum(sales, "gst");
    const expensesBase = sum(expenses, "baseAmount");
    const expensesGst =
      sum(expenses, "gst") ||
      sum(expenses, "sgst") + sum(expenses, "cgst") + sum(expenses, "igst");

    const inputGst = purchasesGst + expensesGst;
    const outputGst = salesGst;
    const netGstPayable = outputGst - inputGst; // liability if positive

    res.json({
      timestamp: new Date().toISOString(),
      startPeriod: appliedStart.toISOString(),
      endPeriod: appliedEnd.toISOString(),
      inventoryValue,
      purchasesBase,
      salesBase,
      expensesBase,
      inputGst,
      outputGst,
      netGstPayable,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Balance sheet failed" });
  }
});

// Profit & Loss (lightweight approximation)
// GET /api/accounts/profit-loss?start=ISO&end=ISO
// Revenue: sum of sales baseAmount (net of GST)
// COGS: approximate using inventory consumption (production_consume) grams * current avgCostPerGram for each raw material
// Operating Expenses: sum expenses baseAmount
// Net Profit Before Tax = Revenue - COGS - Operating Expenses
router.get("/profit-loss", async (req, res) => {
  try {
    const { start, end } = req.query;
    let periodStart = start ? new Date(start) : null;
    let periodEnd = end ? new Date(end) : null;
    if (!periodStart || !periodEnd || isNaN(periodStart) || isNaN(periodEnd)) {
      // default: last 30 days
      periodEnd = new Date();
      periodStart = new Date(Date.now() - 29 * 86400000);
    }
    // Load base data
    const [sales, expenses, consumptionTx, materials] = await Promise.all([
      Sale.findAll({
        where: {
          createdAt: { [Op.gte]: periodStart, [Op.lte]: periodEnd },
        },
      }),
      Expense.findAll({
        where: {
          createdAt: { [Op.gte]: periodStart, [Op.lte]: periodEnd },
        },
      }),
      InventoryTransaction.findAll({
        where: {
          type: "production_consume",
          createdAt: { [Op.gte]: periodStart, [Op.lte]: periodEnd },
        },
      }),
      RawMaterial.findAll(),
    ]);

    const materialMap = Object.fromEntries(materials.map((m) => [m.id, m]));
    const revenueGross = sales.reduce((s, r) => s + (r.total || 0), 0);
    const revenueBase = sales.reduce((s, r) => s + (r.baseAmount || 0), 0);
    const outputGst = sales.reduce((s, r) => s + (r.gst || 0), 0);
    const operatingExpensesBase = expenses.reduce(
      (s, e) => s + (e.baseAmount || 0),
      0
    );
    const inputGstExpenses = expenses.reduce(
      (s, e) => s + (e.gst || e.sgst + e.cgst + e.igst || 0),
      0
    );

    // Aggregate consumption grams per material (deltaGrams stored negative for consume)
    const consumptionByMaterial = {};
    for (const tx of consumptionTx) {
      if (!tx.rawMaterialId) continue;
      const consumed = Math.abs(tx.deltaGrams || 0);
      if (!consumptionByMaterial[tx.rawMaterialId])
        consumptionByMaterial[tx.rawMaterialId] = 0;
      consumptionByMaterial[tx.rawMaterialId] += consumed;
    }
    let cogsEstimated = 0;
    const cogsBreakdown = [];
    for (const [mid, grams] of Object.entries(consumptionByMaterial)) {
      const mat = materialMap[mid];
      if (!mat) continue;
      const cost = grams * (mat.avgCostPerGram || 0);
      cogsEstimated += cost;
      cogsBreakdown.push({
        materialId: parseInt(mid, 10),
        name: mat.name,
        grams,
        avgCostPerGram: mat.avgCostPerGram || 0,
        cost,
      });
    }

    const grossProfit = revenueBase - cogsEstimated;
    const netProfitBeforeTax = grossProfit - operatingExpensesBase;

    res.json({
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      revenueBase,
      revenueGross,
      outputGst,
      operatingExpensesBase,
      inputGstExpenses,
      cogsEstimated,
      grossProfit,
      netProfitBeforeTax,
      cogsBreakdown,
      notes: [
        "COGS is an approximation using current avgCostPerGram; historical cost layers not tracked.",
        "Revenue uses sales baseAmount (net of GST).",
        "Operating expenses use baseAmount (exclusive of GST).",
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profit & Loss failed" });
  }
});

// CSV Export helper
function toCsv(rows, headers) {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    if (/[",\n]/.test(s)) return '"' + s + '"';
    return s;
  };
  const headLine = headers.map((h) => escape(h.label)).join(",");
  const body = rows
    .map((r) => headers.map((h) => escape(r[h.key])).join(","))
    .join("\n");
  return headLine + "\n" + body;
}

// GET /api/accounts/export?type=purchases|sales|expenses|inventory|balanceSheet
router.get("/export", async (req, res) => {
  try {
    const { type } = req.query;
    if (!type)
      return res.status(400).json({ message: "type query param required" });
    let filename = `${type}-${Date.now()}.csv`;
    let csv = "";
    if (type === "purchases") {
      const rows = await Purchase.findAll({ order: [["createdAt", "DESC"]] });
      csv = toCsv(
        rows.map((r) => ({
          date: r.createdAt.toISOString(),
          supplier: r.supplier,
          materialId: r.rawMaterialId,
          quantityGrams: r.quantityGrams,
          total: r.price,
          baseAmount: r.baseAmount,
          gst: r.gst ?? r.sgst + r.cgst + r.igst,
          gstRate: r.gstRate,
        })),
        [
          { key: "date", label: "Date" },
          { key: "supplier", label: "Supplier" },
          { key: "materialId", label: "MaterialId" },
          { key: "quantityGrams", label: "QuantityGrams" },
          { key: "total", label: "Total" },
          { key: "baseAmount", label: "BaseAmount" },
          { key: "gst", label: "GST" },
          { key: "gstRate", label: "GstRate" },
        ]
      );
    } else if (type === "sales") {
      const rows = await Sale.findAll({ order: [["createdAt", "DESC"]] });
      csv = toCsv(
        rows.map((r) => ({
          date: r.createdAt.toISOString(),
          customer: r.customerName,
          invoice: r.invoiceNumber,
          quantity: r.quantity,
          unit: r.unit,
          total: r.total,
          baseAmount: r.baseAmount,
          gst: r.gst,
          gstRate: r.gstRate,
        })),
        [
          { key: "date", label: "Date" },
          { key: "customer", label: "Customer" },
          { key: "invoice", label: "Invoice" },
          { key: "quantity", label: "Quantity" },
          { key: "unit", label: "Unit" },
          { key: "total", label: "Total" },
          { key: "baseAmount", label: "BaseAmount" },
          { key: "gst", label: "GST" },
          { key: "gstRate", label: "GstRate" },
        ]
      );
    } else if (type === "expenses") {
      const rows = await Expense.findAll({ order: [["createdAt", "DESC"]] });
      csv = toCsv(
        rows.map((r) => ({
          date: r.createdAt.toISOString(),
          category: r.category,
          description: r.description,
          total: r.amount,
          baseAmount: r.baseAmount,
          gst: r.gst ?? r.sgst + r.cgst + r.igst,
        })),
        [
          { key: "date", label: "Date" },
          { key: "category", label: "Category" },
          { key: "description", label: "Description" },
          { key: "total", label: "Total" },
          { key: "baseAmount", label: "BaseAmount" },
          { key: "gst", label: "GST" },
        ]
      );
    } else if (type === "inventory") {
      const rows = await RawMaterial.findAll({ order: [["name", "ASC"]] });
      csv = toCsv(
        rows.map((r) => ({
          name: r.name,
          quantityGrams: r.quantityGrams,
          avgCostPerGram: r.avgCostPerGram,
          value: (r.quantityGrams || 0) * (r.avgCostPerGram || 0),
          gstRate: r.gstRate,
        })),
        [
          { key: "name", label: "Name" },
          { key: "quantityGrams", label: "QuantityGrams" },
          { key: "avgCostPerGram", label: "AvgCostPerGram" },
          { key: "value", label: "Value" },
          { key: "gstRate", label: "GstRate" },
        ]
      );
    } else if (type === "balanceSheet") {
      // reuse logic by calling internal handler
      // Ensure we align to current FY as in the API endpoint
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      let fyStart, fyEnd;
      if (month >= 3) {
        fyStart = new Date(year, 3, 1, 0, 0, 0, 0);
        fyEnd = new Date(year + 1, 2, 31, 23, 59, 59, 999);
      } else {
        fyStart = new Date(year - 1, 3, 1, 0, 0, 0, 0);
        fyEnd = new Date(year, 2, 31, 23, 59, 59, 999);
      }
      const materials = await RawMaterial.findAll();
      const inventoryValue = materials.reduce(
        (sum, m) => sum + (m.quantityGrams || 0) * (m.avgCostPerGram || 0),
        0
      );
      const where = { createdAt: { [Op.gte]: fyStart, [Op.lte]: fyEnd } };
      const [purchases, expenses, sales] = await Promise.all([
        Purchase.findAll({ where }),
        Expense.findAll({ where }),
        Sale.findAll({ where }),
      ]);
      const sum = (rows, field) =>
        rows.reduce((a, r) => a + (parseFloat(r[field] || 0) || 0), 0);
      const purchasesBase = sum(purchases, "baseAmount");
      const purchasesGst = sum(purchases, "gst");
      const salesBase = sum(sales, "baseAmount");
      const salesGst = sum(sales, "gst");
      const expensesBase = sum(expenses, "baseAmount");
      const expensesGst =
        sum(expenses, "gst") ||
        sum(expenses, "sgst") + sum(expenses, "cgst") + sum(expenses, "igst");
      const inputGst = purchasesGst + expensesGst;
      const outputGst = salesGst;
      const netGstPayable = outputGst - inputGst;
      csv = toCsv(
        [
          {
            timestamp: new Date().toISOString(),
            startPeriod: fyStart.toISOString(),
            endPeriod: fyEnd.toISOString(),
            inventoryValue,
            purchasesBase,
            salesBase,
            expensesBase,
            inputGst,
            outputGst,
            netGstPayable,
          },
        ],
        [
          { key: "timestamp", label: "Timestamp" },
          { key: "startPeriod", label: "StartPeriod" },
          { key: "endPeriod", label: "EndPeriod" },
          { key: "inventoryValue", label: "InventoryValue" },
          { key: "purchasesBase", label: "PurchasesBase" },
          { key: "salesBase", label: "SalesBase" },
          { key: "expensesBase", label: "ExpensesBase" },
          { key: "inputGst", label: "InputGST" },
          { key: "outputGst", label: "OutputGST" },
          { key: "netGstPayable", label: "NetGstPayable" },
        ]
      );
    } else {
      return res.status(400).json({ message: "Unsupported export type" });
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export failed" });
  }
});

// Create purchase (Unified GST Mode): client sends totalAmount (inclusive) and optional gstRate override.
// Server derives baseAmount = totalAmount / (1 + rate/100) and gst = total - base.
router.post("/purchases", upload.single("invoice"), async (req, res) => {
  try {
    const {
      supplier,
      rawMaterialId,
      quantity,
      unit, // ignored: we now standardize all purchase quantities as kilograms
      totalAmount,
      gstRate: overrideGstRate,
      notes,
    } = req.body;
    const material = await RawMaterial.findByPk(rawMaterialId);
    if (!material) return res.status(400).json({ message: "Invalid material" });
    // NEW RULE: quantity is always interpreted as kilograms regardless of provided unit
    const qtyNum = parseFloat(quantity || 0);
    if (!qtyNum || qtyNum <= 0)
      return res.status(400).json({ message: "Invalid quantity" });
    const quantityGrams = qtyNum * 1000; // kg -> grams
    const gstRate =
      overrideGstRate !== undefined && overrideGstRate !== ""
        ? parseFloat(overrideGstRate)
        : material.gstRate || 0;
    const total = parseFloat(totalAmount || 0);
    if (!total || total <= 0)
      return res.status(400).json({ message: "Invalid total amount" });
    const baseAmount = gstRate ? total / (1 + gstRate / 100) : total;
    const gst = total - baseAmount;
    const purchase = await Purchase.create({
      supplier,
      rawMaterialId,
      quantityGrams,
      price: total,
      baseAmount,
      gst,
      gstRate,
      // legacy fields kept 0 for compatibility
      sgst: 0,
      cgst: 0,
      igst: 0,
      notes,
      invoiceFile: req.file ? `/assets/invoices/${req.file.filename}` : null,
    });
    // Update material quantity & moving average cost (using total cost including tax for simplicity)
    const prevQty = material.quantityGrams;
    const prevCostPerGram = material.avgCostPerGram || 0;
    const prevValue = prevQty * prevCostPerGram;
    const newValue = total;
    const newQty = prevQty + quantityGrams;
    const newAvgCost = newQty ? (prevValue + newValue) / newQty : 0;
    // persist gstRate if material doesn't have one yet or override explicit provided
    if (
      material.gstRate !== gstRate &&
      overrideGstRate !== undefined &&
      overrideGstRate !== ""
    ) {
      await material.update({
        quantityGrams: newQty,
        avgCostPerGram: newAvgCost,
        gstRate,
      });
    } else {
      await material.update({
        quantityGrams: newQty,
        avgCostPerGram: newAvgCost,
      });
    }
    await InventoryTransaction.create({
      type: "purchase",
      rawMaterialId,
      deltaGrams: quantityGrams,
      note: "Purchase added",
      refId: purchase.id,
    });
    res.json(purchase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Purchase failed" });
  }
});

// Helper: recompute moving average cost for a material given all purchases (inclusive tax) currently present
async function recomputeMaterialAverageCost(materialId) {
  const material = await RawMaterial.findByPk(materialId);
  if (!material) return null;
  const purchases = await Purchase.findAll({
    where: { rawMaterialId: materialId },
  });
  const totalQty = purchases.reduce((s, p) => s + (p.quantityGrams || 0), 0);
  const totalValue = purchases.reduce((s, p) => s + (p.price || 0), 0);
  const avg = totalQty ? totalValue / totalQty : 0;
  await material.update({ avgCostPerGram: avg });
  return material;
}

// Edit purchase: allow updating quantity, unit, totalAmount, gstRate, supplier, notes
router.patch("/purchases/:id", upload.single("invoice"), async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase)
      return res.status(404).json({ message: "Purchase not found" });
    const material = await RawMaterial.findByPk(purchase.rawMaterialId);
    if (!material) return res.status(400).json({ message: "Material missing" });

    const {
      quantity,
      unit,
      totalAmount,
      gstRate: overrideGstRate,
      supplier,
      notes,
    } = req.body; // unit ignored

    // Old values
    const oldQty = purchase.quantityGrams;
    const oldTotal = purchase.price;

    // New quantity (grams)
    let newQty = oldQty;
    if (quantity !== undefined) {
      const q = parseFloat(quantity);
      if (!q || q <= 0)
        return res.status(400).json({ message: "Invalid quantity" });
      // EDIT RULE: treat edited quantity value as kilograms
      newQty = q * 1000;
    }
    let newTotal = oldTotal;
    if (totalAmount !== undefined) {
      newTotal = parseFloat(totalAmount);
      if (!newTotal || newTotal <= 0)
        return res.status(400).json({ message: "Invalid totalAmount" });
    }
    // GST handling (unified)
    let gstRate = purchase.gstRate;
    if (overrideGstRate !== undefined && overrideGstRate !== "") {
      gstRate = parseFloat(overrideGstRate) || 0;
    }
    const baseAmount = gstRate ? newTotal / (1 + gstRate / 100) : newTotal;
    const gst = newTotal - baseAmount;

    // Adjust material physical quantity delta first
    const deltaQty = newQty - oldQty; // can be positive or negative
    const updatedQty = (material.quantityGrams || 0) + deltaQty;
    if (updatedQty < 0)
      return res
        .status(400)
        .json({ message: "Edit would make inventory negative" });
    await material.update({ quantityGrams: updatedQty });

    // Update purchase row
    await purchase.update({
      quantityGrams: newQty,
      price: newTotal,
      baseAmount,
      gst,
      gstRate,
      supplier: supplier !== undefined ? supplier : purchase.supplier,
      notes: notes !== undefined ? notes : purchase.notes,
      invoiceFile: req.file
        ? `/assets/invoices/${req.file.filename}`
        : purchase.invoiceFile,
    });

    // Recompute average cost from all purchases to maintain valuation integrity
    await recomputeMaterialAverageCost(purchase.rawMaterialId);

    if (deltaQty !== 0) {
      await InventoryTransaction.create({
        type: "purchase_edit",
        rawMaterialId: purchase.rawMaterialId,
        deltaGrams: deltaQty,
        note: "Purchase edited",
        refId: purchase.id,
      });
    }

    res.json(purchase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Purchase edit failed" });
  }
});

// Delete (reverse) purchase
router.delete("/purchases/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase)
      return res.status(404).json({ message: "Purchase not found" });
    const material = await RawMaterial.findByPk(purchase.rawMaterialId);
    if (!material) return res.status(400).json({ message: "Material missing" });

    const updatedQty = (material.quantityGrams || 0) - purchase.quantityGrams;
    if (updatedQty < 0)
      return res
        .status(400)
        .json({ message: "Reversal would make inventory negative" });
    await purchase.destroy();
    await material.update({ quantityGrams: updatedQty });

    // Recompute average cost using remaining purchases
    await recomputeMaterialAverageCost(material.id);

    await InventoryTransaction.create({
      type: "purchase_reversal",
      rawMaterialId: material.id,
      deltaGrams: -purchase.quantityGrams,
      note: "Purchase reversed (deleted)",
      refId: purchase.id,
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Purchase reversal failed" });
  }
});

// Expenses list
router.get("/expenses", async (req, res) => {
  const list = await Expense.findAll({ order: [["createdAt", "DESC"]] });
  res.json(list);
});

// Create expense
router.post("/expenses", upload.single("invoice"), async (req, res) => {
  try {
    const {
      category,
      description,
      baseAmount,
      sgstRate,
      cgstRate,
      igstRate,
      notes,
    } = req.body;
    const taxes = computeTaxes(baseAmount, sgstRate, cgstRate, igstRate);
    const expense = await Expense.create({
      category,
      description,
      amount: taxes.total,
      baseAmount: taxes.baseAmount,
      sgst: taxes.sgst,
      cgst: taxes.cgst,
      igst: taxes.igst,
      notes,
      invoiceFile: req.file ? `/assets/invoices/${req.file.filename}` : null,
    });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Expense failed" });
  }
});

module.exports = router;
