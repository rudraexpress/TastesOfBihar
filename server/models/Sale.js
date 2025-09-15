const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const sequelize = getSequelize();

// Sale represents an outward taxable supply (finished goods sale)
// We capture total (gross), baseAmount (net of GST), gst (tax portion) and gstRate used.
// Optionally can be linked to a product in future (productId nullable for generic invoices).
const Sale = sequelize.define("Sale", {
  customerName: { type: DataTypes.STRING },
  invoiceNumber: { type: DataTypes.STRING },
  productId: { type: DataTypes.INTEGER }, // optional linkage
  quantity: { type: DataTypes.FLOAT, defaultValue: 1 },
  unit: { type: DataTypes.STRING },
  total: { type: DataTypes.FLOAT, allowNull: false }, // total price inclusive of GST
  baseAmount: { type: DataTypes.FLOAT, allowNull: false },
  gst: { type: DataTypes.FLOAT, defaultValue: 0 },
  gstRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  notes: { type: DataTypes.TEXT },
});

module.exports = Sale;
