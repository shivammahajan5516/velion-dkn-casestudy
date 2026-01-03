const router = require("express").Router();
const auth = require("../middleware/auth");
const Asset = require("../models/Asset");
const User = require("../models/User");
const sha256FromString = require("../utils/hash");

router.get("/", auth, async (req, res) => {
  const q = (req.query.query || "").toLowerCase().trim();
  const filter = q
    ? { $or: [{ title: new RegExp(q, "i") }, { tags: new RegExp(q, "i") }] }
    : {};

  const userId = req.user.userId;

  const results = await Asset.find({
    ...filter,
    $or: [{ visibility: "GLOBAL", status: "VERIFIED" }, { authorId: userId }]
  }).sort({ updatedAt: -1 });

  res.json(results);
});

router.post("/", auth, async (req, res) => {
  try {
    const title = (req.body.title || "").trim();
    const description = (req.body.description || "").trim();
    const tags = (req.body.tags || []).map(t => String(t).toLowerCase().trim()).filter(Boolean);
    const sourceType = req.body.sourceType === "TEXT" ? "TEXT" : "URL";
    const sourceValue = (req.body.sourceValue || "").trim();

    if (!title || !sourceValue) return res.status(400).json({ message: "Missing data" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    const hash = sha256FromString(`${title}|${sourceType}|${sourceValue}`);
    const storageLocation = user.region === "EU" ? "EU_SERVER" : "GLOBAL_SERVER";

    const asset = await Asset.create({
      title,
      description,
      tags,
      authorId: user._id,
      hash,
      storageLocation,
      status: "PENDING",
      visibility: "PRIVATE",
      sourceType,
      sourceValue
    });

    res.json(asset);
  } catch (e) {
    if (String(e.message || "").includes("duplicate key")) {
      return res.status(409).json({ message: "Duplicate asset (same hash)" });
    }
    return res.status(500).json({ message: "Create asset failed", error: String(e.message || e) });
  }
});

module.exports = router;
