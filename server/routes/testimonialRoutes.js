const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Testimonial = require("../models/Testimonial");
const User = require("../models/User");

// Storage config (safely inside project assets/uploads)
const uploadRoot = path.join(__dirname, "..", "..", "assets", "uploads");
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }
    cb(null, true);
  },
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Helper to build public asset path
const toPublicPath = (filename) => `/assets/uploads/${filename}`;

// Get all testimonials (newest first)
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["id", "name", "avatar"] }],
    });
    res.json(testimonials);
  } catch (err) {
    console.error("Fetch testimonials error", err);
    res.status(500).json({ error: "Failed to load testimonials" });
  }
});

// Add a testimonial with optional media (fields: content, userId)
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { content, userId } = req.body;
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Content is required" });
      }
      let imageUrl, videoUrl, avatarUrl, userName;
      if (req.files?.image?.[0]) {
        imageUrl = toPublicPath(req.files.image[0].filename);
      }
      if (req.files?.video?.[0]) {
        videoUrl = toPublicPath(req.files.video[0].filename);
      }
      let user = null;
      if (userId) {
        user = await User.findByPk(userId);
        if (user) {
          avatarUrl = user.avatar || null;
          userName = user.name;
        }
      }
      const testimonial = await Testimonial.create({
        content: content.trim(),
        imageUrl,
        videoUrl,
        avatarUrl,
        userName,
        userId: user ? user.id : null,
      });
      const withUser = await Testimonial.findByPk(testimonial.id, {
        include: [{ model: User, attributes: ["id", "name", "avatar"] }],
      });
      res.status(201).json(withUser);
    } catch (err) {
      console.error("Create testimonial error", err);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  }
);

// Update testimonial visibility or moderation fields
router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await Testimonial.update(req.body, { where: { id } });
    const updated = await Testimonial.findByPk(id, {
      include: [{ model: User, attributes: ["id", "name", "avatar"] }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});

module.exports = router;
