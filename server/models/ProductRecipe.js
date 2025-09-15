const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const sequelize = getSequelize();

// Links Product to RawMaterial with required grams per 1 unit (piece/pack) OR per 1000 grams produced
// mode: 'per_unit' or 'per_kg' (per kilogram of finished product)
const ProductRecipe = sequelize.define("ProductRecipe", {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  rawMaterialId: { type: DataTypes.INTEGER, allowNull: false },
  grams: { type: DataTypes.FLOAT, allowNull: false },
  mode: { type: DataTypes.STRING, defaultValue: "per_unit" },
});

module.exports = ProductRecipe;
