const { Sequelize } = require("sequelize");

// Use environment variables if provided, otherwise attempt default Postgres
const pgConfig = {
  database: process.env.DB_NAME || "tasteofbihar",
  username: process.env.DB_USER || "your_db_user",
  password: process.env.DB_PASS || "your_db_password",
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
};

// Default to SQLite for local development. If you want to use Postgres, set USE_PG=true
// Initialize sequelize with SQLite immediately so models can be defined at require-time
let sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "f:/TasteOfBihar/server/dev.sqlite",
  logging: false,
});

const connectDB = async () => {
  // If explicitly requested, try to use Postgres (will replace sequelize instance)
  if (process.env.USE_PG === "true") {
    const pgSequelize = new Sequelize(
      pgConfig.database,
      pgConfig.username,
      pgConfig.password,
      {
        host: pgConfig.host,
        dialect: "postgres",
        logging: false,
      }
    );
    try {
      await pgSequelize.authenticate();
      sequelize = pgSequelize;
      console.log("PostgreSQL connected");
      return;
    } catch (pgErr) {
      console.error("PostgreSQL connection failed:", pgErr.message || pgErr);
      console.error(
        "Continuing with SQLite. To force failure on Postgres errors set USE_PG=true and ensure Postgres is reachable."
      );
    }
  }

  // Test current (SQLite) connection
  try {
    await sequelize.authenticate();
    console.log("SQLite connected");
  } catch (sqliteErr) {
    console.error("SQLite connection error:", sqliteErr);
    process.exit(1);
  }
};

const getSequelize = () => sequelize;

module.exports = { connectDB, getSequelize };
