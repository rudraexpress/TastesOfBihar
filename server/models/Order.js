const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");

const sequelize = getSequelize();

const Order = sequelize.define("Order", {
  customerName: { type: DataTypes.STRING },
  total: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
});

module.exports = Order;
