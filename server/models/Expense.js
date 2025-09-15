const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const sequelize = getSequelize();

// Non-inventory expenses like advertising
const Expense = sequelize.define("Expense", {
  category: { type: DataTypes.STRING }, // advertising, utilities, rent, etc.
  description: { type: DataTypes.TEXT },
  amount: { type: DataTypes.FLOAT, allowNull: false }, // total inclusive
  baseAmount: { type: DataTypes.FLOAT, allowNull: false },
  sgst: { type: DataTypes.FLOAT, defaultValue: 0 },
  cgst: { type: DataTypes.FLOAT, defaultValue: 0 },
  igst: { type: DataTypes.FLOAT, defaultValue: 0 },
  invoiceFile: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
});

module.exports = Expense;
