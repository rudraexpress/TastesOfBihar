const express = require("express");
const cors = require("cors");
const { connectDB, getSequelize } = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const accountsRoutes = require("./routes/accountsRoutes");
const salesRoutes = require("./routes/salesRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const path = require("path");

// Serve project-level assets folder at /assets so frontend can reference uploaded images/videos
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

// API routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/sales", salesRoutes);

app.get("/", (req, res) => {
  res.send("Taste of Bihar API running");
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

const start = async () => {
  await connectDB();

  console.log("Starting server without database sync...");
  const sequelize = getSequelize();

  if (sequelize) {
    console.log(
      "Database connection available - but no sync will be performed"
    );
  } else {
    console.log("No database connection - server running in standalone mode");
  }

  // Try to listen on DEFAULT_PORT, if in use try next ports up to +10
  for (let p = DEFAULT_PORT; p < DEFAULT_PORT + 11; p++) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(p, () => {
          console.log(`Server running on port ${p}`);
          console.log(
            `No database connected - API will return empty/default responses`
          );
          resolve(server);
        });
        server.on("error", (err) => reject(err));
      });
      break; // successful
    } catch (err) {
      if (err && err.code === "EADDRINUSE") {
        console.warn(`Port ${p} in use, trying ${p + 1}...`);
        continue;
      }
      console.error("Server failed to start:", err);
      process.exit(1);
    }
  }
};

start();
