const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");

const sequelize = getSequelize();

const Testimonial = sequelize.define("Testimonial", {
  content: { type: DataTypes.TEXT, allowNull: false },
  imageUrl: { type: DataTypes.STRING }, // stored relative path under /assets/uploads
  videoUrl: { type: DataTypes.STRING }, // stored relative path under /assets/uploads
  avatarUrl: { type: DataTypes.STRING }, // snapshot or provided user avatar at submission time (denormalized for history)
  userName: { type: DataTypes.STRING }, // denormalize to keep name even if user changes later
  visible: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// Association helper (called from a central place if needed)
try {
  const User = require("./User");
  if (User && typeof User.hasMany === "function") {
    User.hasMany(Testimonial, { foreignKey: "userId" });
    Testimonial.belongsTo(User, { foreignKey: "userId" });
  }
} catch (err) {
  // silent: association will be set up elsewhere if circular import issues arise
}

module.exports = Testimonial;
