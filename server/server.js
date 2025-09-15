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
  // Sync Sequelize models
  const sequelize = getSequelize();
  // Pre-flight: detect and repair duplicate/null Expense IDs that would break alter backup
  try {
    // Check if Expenses table exists first
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='Expenses'"
    );

    if (tables && tables.length > 0) {
      console.log("Checking Expenses table for anomalies...");

      // Clean up any leftover backup tables from previous failed attempts
      try {
        await sequelize.query("DROP TABLE IF EXISTS Expenses_backup");
        console.log("Cleaned up any leftover Expenses_backup table");
      } catch (cleanupErr) {
        console.warn("Could not clean Expenses_backup:", cleanupErr.message);
      }

      // Detect anomalies (duplicates, nulls) and also verify pragma table info for id as PK
      const [dupRows] = await sequelize.query(
        "SELECT id, COUNT(*) c FROM Expenses GROUP BY id HAVING c > 1"
      );
      const [nullRows] = await sequelize.query(
        "SELECT rowid FROM Expenses WHERE id IS NULL"
      );
      const [pragma] = await sequelize.query("PRAGMA table_info('Expenses')");
      const idCol = Array.isArray(pragma)
        ? pragma.find((c) => c.name === "id")
        : null;
      const pkOk = idCol && idCol.pk === 1; // expect primary key

      console.log(
        `Found ${dupRows.length} duplicate ID groups, ${nullRows.length} null IDs, PK status: ${pkOk}`
      );

      if (
        (dupRows && dupRows.length) ||
        (nullRows && nullRows.length) ||
        !pkOk
      ) {
        console.warn(
          "Rebuilding Expenses table due to anomalies (duplicates/null/primary key issue)..."
        );
        // Fetch all rows with a generated surrogate row number so we can assign new IDs deterministically
        const [allRows] = await sequelize.query(
          "SELECT rowid as _rowid_, id, category, description, amount, baseAmount, sgst, cgst, igst, invoiceFile, notes, createdAt, updatedAt FROM Expenses ORDER BY createdAt ASC, rowid ASC"
        );
        // Build new structure in a transaction to minimize risk
        await sequelize.transaction(async (t) => {
          await sequelize.query(
            "ALTER TABLE Expenses RENAME TO Expenses_corrupt_backup",
            { transaction: t }
          );
          await sequelize.query(
            `CREATE TABLE Expenses (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            category VARCHAR(255),\n            description TEXT,\n            amount FLOAT NOT NULL,\n            baseAmount FLOAT NOT NULL,\n            sgst FLOAT DEFAULT 0,\n            cgst FLOAT DEFAULT 0,\n            igst FLOAT DEFAULT 0,\n            invoiceFile VARCHAR(255),\n            notes TEXT,\n            createdAt DATETIME NOT NULL,\n            updatedAt DATETIME NOT NULL\n          )`,
            { transaction: t }
          );
          // Reinsert rows; if original id is valid and unique keep it, otherwise let AUTOINCREMENT assign
          const seen = new Set();
          for (const r of allRows) {
            let insertWithId = false;
            if (r.id != null && !seen.has(r.id)) {
              insertWithId = true;
              seen.add(r.id);
            }
            const fields = [
              "category",
              "description",
              "amount",
              "baseAmount",
              "sgst",
              "cgst",
              "igst",
              "invoiceFile",
              "notes",
              "createdAt",
              "updatedAt",
            ];
            if (insertWithId) {
              await sequelize.query(
                `INSERT INTO Expenses (id, ${fields.join(
                  ","
                )}) VALUES (:id, :category, :description, :amount, :baseAmount, :sgst, :cgst, :igst, :invoiceFile, :notes, :createdAt, :updatedAt)`,
                { transaction: t, replacements: r }
              );
            } else {
              await sequelize.query(
                `INSERT INTO Expenses (${fields.join(
                  ","
                )}) VALUES (:category, :description, :amount, :baseAmount, :sgst, :cgst, :igst, :invoiceFile, :notes, :createdAt, :updatedAt)`,
                { transaction: t, replacements: r }
              );
            }
          }
          console.warn(
            `Expenses table rebuilt: ${allRows.length} rows migrated.`
          );
          // Keep backup table for manual inspection; could drop if desired
        });
      }
    } else {
      console.log(
        "Expenses table does not exist yet, skipping preflight check."
      );
    }
  } catch (repairErr) {
    console.error(
      "Pre-sync Expense rebuild failed (will attempt sync anyway):",
      repairErr
    );
  }

  try {
    await sequelize.sync({ alter: true });
  } catch (err) {
    const isExpensesBackupError =
      err &&
      /Expenses_backup\.id/.test(err.message || "") &&
      err.name === "SequelizeUniqueConstraintError";
    if (isExpensesBackupError) {
      console.error(
        "Alter sync failed due to lingering Expenses duplicate ID issue. Initiating salvage rebuild (destructive for Expenses schema)."
      );
      try {
        await sequelize.transaction(async (t) => {
          // If an in-progress backup table exists from a failed alter, drop it first to avoid name collisions
          await sequelize.query("DROP TABLE IF EXISTS Expenses_backup", {
            transaction: t,
          });
          // Preserve a copy of current (possibly inconsistent) table for forensic review
          await sequelize.query(
            "ALTER TABLE Expenses RENAME TO Expenses_pre_salvage",
            { transaction: t }
          );
          await sequelize.query(
            `CREATE TABLE Expenses (\n              id INTEGER PRIMARY KEY AUTOINCREMENT,\n              category VARCHAR(255),\n              description TEXT,\n              amount FLOAT NOT NULL,\n              baseAmount FLOAT NOT NULL,\n              sgst FLOAT DEFAULT 0,\n              cgst FLOAT DEFAULT 0,\n              igst FLOAT DEFAULT 0,\n              invoiceFile VARCHAR(255),\n              notes TEXT,\n              createdAt DATETIME NOT NULL,\n              updatedAt DATETIME NOT NULL\n            )`,
            { transaction: t }
          );
          // Copy distinct rows from salvage source; ignore duplicate/null ids by letting autoincrement assign
          // Use COALESCE to ensure timestamps (fallback to now if null)
          const now = new Date().toISOString();
          await sequelize.query(
            `INSERT INTO Expenses (category, description, amount, baseAmount, sgst, cgst, igst, invoiceFile, notes, createdAt, updatedAt)\n             SELECT category, description, amount, baseAmount, sgst, cgst, igst, invoiceFile, notes,\n                    COALESCE(createdAt, :now), COALESCE(updatedAt, :now)\n             FROM Expenses_pre_salvage\n             GROUP BY rowid`,
            { transaction: t, replacements: { now } }
          );
          console.warn(
            "Expenses salvage rebuild complete. Original table kept as Expenses_pre_salvage."
          );
        });
        // Retry sync without alter for Expenses specifically to avoid triggering backup logic again
        await sequelize.sync();
        console.log("Post-salvage sync successful.");
      } catch (salvageErr) {
        console.error("Salvage rebuild failed:", salvageErr);
        throw salvageErr; // rethrow to crash so user can inspect
      }
    } else {
      throw err; // not our targeted error; rethrow
    }
  }

  // Try to listen on DEFAULT_PORT, if in use try next ports up to +10
  for (let p = DEFAULT_PORT; p < DEFAULT_PORT + 11; p++) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(p, () => {
          console.log(`Server running on port ${p}`);
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
