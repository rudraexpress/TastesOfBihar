const express = require("express");
const router = express.Router();

// Return empty array for testimonials when no database connected
router.get("/", async (req, res) => {
  res.json([]);
});

// Return service unavailable for other operations
router.use((req, res) => {
  res.status(503).json({
    message: "Database not connected - testimonial service unavailable",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
