const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const sequelize = getSequelize();

// Purchase of raw materials; quantity converted to grams
const Purchase = sequelize.define("Purchase", {
  supplier: { type: DataTypes.STRING },
  rawMaterialId: { type: DataTypes.INTEGER, allowNull: false },
  quantityGrams: { type: DataTypes.FLOAT, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false }, // total price inclusive of taxes
  baseAmount: { type: DataTypes.FLOAT, allowNull: false },
  // Legacy separate fields kept for backward compatibility; new unified GST stored in gst & gstRate
  sgst: { type: DataTypes.FLOAT, defaultValue: 0 },
  cgst: { type: DataTypes.FLOAT, defaultValue: 0 },
  igst: { type: DataTypes.FLOAT, defaultValue: 0 },
  gst: { type: DataTypes.FLOAT, defaultValue: 0 }, // unified GST value
  gstRate: { type: DataTypes.FLOAT, defaultValue: 0 }, // percentage used for this purchase
  invoiceFile: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
});

module.exports = Purchase;
