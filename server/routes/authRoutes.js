const express = require("express");
const router = express.Router();

// Return service unavailable for authentication
router.use((req, res) => {
  res.status(503).json({
    message: "Database not connected - authentication service unavailable",
    error: "SERVICE_UNAVAILABLE",
  });
});

module.exports = router;
