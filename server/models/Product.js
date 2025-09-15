const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");

const sequelize = getSequelize();

// Extended to support granular stock in grams for production calculations
const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT },
  imageUrl: { type: DataTypes.STRING },
  localImage: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 }, // unit-level stock (e.g., packs/pieces)
  stockGrams: { type: DataTypes.FLOAT, defaultValue: 0 }, // optional produced mass for cost basis
});

module.exports = Product;
