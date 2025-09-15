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
  const User = sequelize.define("User", {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING }, // nullable for social accounts
    googleId: { type: DataTypes.STRING, unique: true, allowNull: true },
    avatar: { type: DataTypes.STRING },
    provider: { type: DataTypes.STRING },
  });

  module.exports = User;
}
