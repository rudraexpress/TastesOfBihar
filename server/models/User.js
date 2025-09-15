const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");

const sequelize = getSequelize();

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING }, // nullable for social accounts
  googleId: { type: DataTypes.STRING, unique: true, allowNull: true },
  avatar: { type: DataTypes.STRING },
  provider: { type: DataTypes.STRING },
});

module.exports = User;
