const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");

const sequelize = getSequelize();

// Raw materials like flour, sugar, ghee etc.
// quantity stored in grams for uniformity; purchase can specify kg which converts to grams.
const RawMaterial = sequelize.define("RawMaterial", {
  name: { type: DataTypes.STRING, unique: true },
  unit: { type: DataTypes.STRING, defaultValue: "g" }, // base display unit (g, kg, ml, l, pcs)
  quantityGrams: { type: DataTypes.FLOAT, defaultValue: 0 }, // base quantity in grams (or ml for liquids treated similarly)
  reorderLevelGrams: { type: DataTypes.FLOAT, defaultValue: 0 }, // alert threshold
  avgCostPerGram: { type: DataTypes.FLOAT, defaultValue: 0 }, // moving average cost basis
  gstRate: { type: DataTypes.FLOAT, defaultValue: 0 }, // unified GST percentage for this material
});

module.exports = RawMaterial;
