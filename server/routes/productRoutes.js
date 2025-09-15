const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

// Ensure uploads directory exists (inside project-level assets for unified serving)
const uploadsDir = path.join(__dirname, "..", "..", "assets", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".dat";
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// Get all products - return empty array when no database connected
router.get("/", async (req, res) => {
  res.json([]);
});

// Add a product - return error when no database connected
router.post("/", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot create products",
    error: "SERVICE_UNAVAILABLE",
  });
});

// Get single product - return error when no database connected
router.get("/:id", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot fetch product",
    error: "SERVICE_UNAVAILABLE",
  });
});

// Update product - return error when no database connected
router.put("/:id", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot update product",
    error: "SERVICE_UNAVAILABLE",
  });
});

// Delete product - return error when no database connected
router.delete("/:id", async (req, res) => {
  res.status(503).json({
    message: "Database not connected - cannot delete product",
    error: "SERVICE_UNAVAILABLE",
  });
});

// Image upload endpoint
router.post("/upload", upload.single("image"), (req, res) => {
  const filename = path.basename(req.file.filename);
  // Public URL relative to /assets (server.js already serves that folder)
  const url = `/assets/uploads/${filename}`;
  res.json({ filename, url });
});

module.exports = router;

module.exports = router;
