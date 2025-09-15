const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");

const sequelize = getSequelize();

// If no database connection, export a mock model
if (!sequelize) {
  module.exports = {
    findAll: () => Promise.resolve([]),
    findByPk: () => Promise.resolve(null),
    create: () => Promise.reject(new Error("Database not connected")),
    update: () => Promise.reject(new Error("Database not connected")),
    destroy: () => Promise.reject(new Error("Database not connected")),
  };
} else {
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
}
