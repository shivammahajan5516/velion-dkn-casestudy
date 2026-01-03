const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/signup", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").toLowerCase().trim();
    const password = req.body.password || "";
    const region = (req.body.region || "EU").trim();

    if (!name || !email || password.length < 6) {
      return res.status(400).json({ message: "Invalid signup data" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, region });

    return res.json({ ok: true, userId: user._id });
  } catch (e) {
    return res.status(500).json({ message: "Signup error", error: String(e.message || e) });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = req.body.password || "";

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, points: user.points, region: user.region }
    });
  } catch (e) {
    return res.status(500).json({ message: "Signin error", error: String(e.message || e) });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  return res.json(user);
});

module.exports = router;
