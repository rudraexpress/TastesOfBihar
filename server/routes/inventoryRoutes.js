const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const RawMaterial = require("../models/RawMaterial");
const Product = require("../models/Product");
const ProductRecipe = require("../models/ProductRecipe");
const InventoryTransaction = require("../models/InventoryTransaction");
// New: support wastage/spoilage adjustments

// Associations (lightweight) - not strictly needed for queries below but allow eager loading later
// Not using sequelize association definitions here to keep existing pattern simple.

// Helpers
function toGrams(value, unit) {
  const v = parseFloat(value || 0);
  if (unit === "kg") return v * 1000;
  if (unit === "g") return v;
  if (unit === "l") return v * 1000; // treat ml as grams analog
  if (unit === "ml") return v;
  if (unit === "pcs") return v; // piece wise stored directly
  return v; // fallback
}

// CRUD Raw Materials
router.get("/materials", async (req, res) => {
  const list = await RawMaterial.findAll();
  res.json(list);
});

router.post("/materials", async (req, res) => {
  const { name, unit = "g", reorderLevel, reorderLevelGrams } = req.body;
  let rl = reorderLevelGrams;
  if (!rl && reorderLevel) rl = toGrams(reorderLevel, unit);
  const material = await RawMaterial.create({
    name,
    unit,
    reorderLevelGrams: rl,
  });
  res.json(material);
});

router.put("/materials/:id", async (req, res) => {
  const m = await RawMaterial.findByPk(req.params.id);
  if (!m) return res.status(404).json({ message: "Not found" });
  const { name, unit, reorderLevel, reorderLevelGrams } = req.body;
  let rl = reorderLevelGrams;
  if (!rl && reorderLevel) rl = toGrams(reorderLevel, unit || m.unit);
  await m.update({ name, unit, reorderLevelGrams: rl });
  res.json(m);
});

router.delete("/materials/:id", async (req, res) => {
  const m = await RawMaterial.findByPk(req.params.id);
  if (!m) return res.status(404).json({ message: "Not found" });
  await m.destroy();
  res.json({ success: true });
});

// Get recipe for product
router.get("/products/:productId/recipe", async (req, res) => {
  const rows = await ProductRecipe.findAll({
    where: { productId: req.params.productId },
  });
  res.json(rows);
});

// Replace recipe for product
router.post("/products/:productId/recipe", async (req, res) => {
  const { items, mode } = req.body; // items: [{rawMaterialId, grams}]
  const productId = req.params.productId;
  await ProductRecipe.destroy({ where: { productId } });
  if (Array.isArray(items)) {
    for (const it of items) {
      if (!it.rawMaterialId || !it.grams) continue;
      await ProductRecipe.create({
        productId,
        rawMaterialId: it.rawMaterialId,
        grams: parseFloat(it.grams),
        mode: it.mode || mode || "per_unit",
      });
    }
  }
  const rows = await ProductRecipe.findAll({ where: { productId } });
  res.json(rows);
});

// Low stock alert list
router.get("/materials-low-stock", async (req, res) => {
  const list = await RawMaterial.findAll();
  const low = list.filter(
    (m) => m.reorderLevelGrams && m.quantityGrams <= m.reorderLevelGrams
  );
  res.json(low);
});

// Production endpoint
router.post("/produce", async (req, res) => {
  /* Body: { productId, unitsProduced, outputMassGrams (optional) }
     Uses recipe rows (mode per_unit) to consume raw materials proportionally. */
  const { productId, unitsProduced, outputMassGrams } = req.body;
  const product = await Product.findByPk(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  const recipe = await ProductRecipe.findAll({ where: { productId } });
  if (!recipe.length)
    return res.status(400).json({ message: "No recipe defined" });
  const u = parseFloat(unitsProduced || 0);
  if (!u || u <= 0) return res.status(400).json({ message: "Invalid units" });

  // Check availability
  for (const r of recipe) {
    if (r.mode === "per_unit") {
      const needed = r.grams * u;
      const material = await RawMaterial.findByPk(r.rawMaterialId);
      if (!material || material.quantityGrams < needed) {
        return res
          .status(400)
          .json({ message: `Insufficient material: ${r.rawMaterialId}` });
      }
      if (material.quantityGrams - needed < 0) {
        return res.status(400).json({
          message: `Negative inventory prevented for material ${material.name}`,
        });
      }
    }
  }

  // Deduct raw materials
  for (const r of recipe) {
    if (r.mode === "per_unit") {
      const needed = r.grams * u;
      const material = await RawMaterial.findByPk(r.rawMaterialId);
      await material.update({ quantityGrams: material.quantityGrams - needed });
      await InventoryTransaction.create({
        type: "production_consume",
        productId,
        rawMaterialId: r.rawMaterialId,
        deltaGrams: -needed,
        note: `Consumed for production of ${u} units`,
      });
    }
  }

  // Increase product stock (units)
  product.stock += u;
  if (outputMassGrams) product.stockGrams += parseFloat(outputMassGrams);
  await product.save();
  await InventoryTransaction.create({
    type: "production_output",
    productId,
    deltaGrams: outputMassGrams || 0,
    note: `Produced ${u} units`,
  });

  res.json({ success: true, product });
});

module.exports = router;
// Wastage / Spoilage recording
// POST /api/inventory/wastage  body: { rawMaterialId?, productId?, quantity, unit (g|kg|ml|l|pcs), reason, notes }
// Reduces stock; records InventoryTransaction with type 'wastage'
router.post("/wastage", async (req, res) => {
  try {
    const { rawMaterialId, productId, quantity, unit, reason, notes } =
      req.body;
    if (!rawMaterialId && !productId) {
      return res
        .status(400)
        .json({ message: "Provide rawMaterialId or productId" });
    }
    const qtyNum = parseFloat(quantity || 0);
    if (!qtyNum || qtyNum <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

    if (rawMaterialId) {
      const material = await RawMaterial.findByPk(rawMaterialId);
      if (!material)
        return res.status(404).json({ message: "Material not found" });
      const grams = toGrams(qtyNum, unit || material.unit);
      if (material.quantityGrams < grams)
        return res.status(400).json({ message: "Insufficient material stock" });
      await material.update({ quantityGrams: material.quantityGrams - grams });
      await InventoryTransaction.create({
        type: "wastage",
        rawMaterialId,
        deltaGrams: -grams,
        note: `Wastage: ${reason || "unspecified"}${
          notes ? " - " + notes : ""
        }`,
      });
      return res.json({ success: true });
    }

    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      // For products: treat quantity as units if unit === 'pcs' or unspecified; else if grams, convert
      let deltaUnits = 0;
      let deltaGrams = 0;
      if (!unit || unit === "pcs") {
        if (product.stock < qtyNum)
          return res
            .status(400)
            .json({ message: "Insufficient product stock" });
        product.stock -= qtyNum;
        deltaUnits = qtyNum;
      } else {
        const grams = toGrams(qtyNum, unit);
        if (product.stockGrams < grams)
          return res
            .status(400)
            .json({ message: "Insufficient product mass stock" });
        product.stockGrams -= grams;
        deltaGrams = grams;
      }
      await product.save();
      await InventoryTransaction.create({
        type: "wastage",
        productId,
        deltaGrams: deltaGrams ? -deltaGrams : 0,
        note: `Wastage product: ${reason || "unspecified"}${
          notes ? " - " + notes : ""
        } ${deltaUnits ? "(" + deltaUnits + " units)" : ""}`,
      });
      return res.json({ success: true });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Wastage record failed" });
  }
});

// GET /api/inventory/wastage  - list wastage transactions recent first
router.get("/wastage", async (req, res) => {
  const rows = await InventoryTransaction.findAll({
    where: { type: "wastage" },
    order: [["createdAt", "DESC"]],
    limit: 200,
  });
  res.json(rows);
});
