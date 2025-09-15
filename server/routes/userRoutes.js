const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all users
router.get("/", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Register user
router.post("/register", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

module.exports = router;
