const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const Product = require("../models/Product");

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

// Get all products
router.get("/", async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// Add a product
router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

// Get single product
router.get("/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

// Update product
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const product = await Product.findByPk(id);
  if (!product) return res.status(404).json({ message: "Not found" });
  await product.update(req.body);
  res.json(product);
});

// Delete product
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const product = await Product.findByPk(id);
  if (!product) return res.status(404).json({ message: "Not found" });
  await product.destroy();
  res.json({ success: true });
});

// Image upload endpoint
router.post("/upload", upload.single("image"), (req, res) => {
  const filename = path.basename(req.file.filename);
  // Public URL relative to /assets (server.js already serves that folder)
  const url = `/assets/uploads/${filename}`;
  res.json({ filename, url });
});

module.exports = router;
