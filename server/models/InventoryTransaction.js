const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const sequelize = getSequelize();

// Records changes to raw material or product inventory for audit
// Types used:
//  - purchase: raw material stock increased from a purchase
//  - purchase_edit: adjustment after editing an existing purchase (delta between old and new)
//  - purchase_reversal: full reversal (deletion) of a purchase
//  - production_consume: raw materials consumed for production
//  - production_output: finished product stock increased
//  - wastage: stock decreased due to damage/spoilage/etc
//  - adjustment: manual corrections (reserved)
const InventoryTransaction = sequelize.define("InventoryTransaction", {
  type: { type: DataTypes.STRING },
  productId: { type: DataTypes.INTEGER, allowNull: true },
  rawMaterialId: { type: DataTypes.INTEGER, allowNull: true },
  deltaGrams: { type: DataTypes.FLOAT, defaultValue: 0 },
  note: { type: DataTypes.TEXT },
  refId: { type: DataTypes.INTEGER }, // purchaseId / production batch id / expense id
});

module.exports = InventoryTransaction;
