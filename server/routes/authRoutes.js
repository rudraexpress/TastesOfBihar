const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""; // set in env
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// POST /api/auth/google
// Body: { credential: <ID_TOKEN> }
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ error: "Missing credential" });

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ where: { googleId } });
    if (!user) {
      // Try matching existing email first
      if (email) {
        user = await User.findOne({ where: { email } });
      }
      if (!user) {
        user = await User.create({
          name,
          email,
          // password left null for social login
          googleId,
          avatar: picture,
          provider: "google",
        });
      } else {
        // update user with googleId if linking
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        user.provider = user.provider || "google";
        await user.save();
      }
    }

    // For simplicity we return a pseudo token (in production use JWT)
    const tokenPayload = { id: user.id, email: user.email };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google auth error", err);
    res.status(401).json({ error: "Invalid Google credential" });
  }
});

module.exports = router;
