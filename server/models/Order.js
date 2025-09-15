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
  const Order = sequelize.define("Order", {
    customerName: { type: DataTypes.STRING },
    total: { type: DataTypes.FLOAT },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
  });

  module.exports = Order;
}
