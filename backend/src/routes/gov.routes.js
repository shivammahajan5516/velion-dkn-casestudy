const router = require("express").Router();
const auth = require("../middleware/auth");
const Asset = require("../models/Asset");
const User = require("../models/User");

function checkGov(req, res) {
  const govId = String(req.query.govId || "");
  if (!govId || govId !== process.env.GOVERNANCE_ID) {
    res.status(403).json({ message: "Invalid Governance ID" });
    return false;
  }
  return true;
}

router.get("/pending", auth, async (req, res) => {
  if (!checkGov(req, res)) return;
  const list = await Asset.find({ status: "PENDING" }).sort({ createdAt: -1 });
  res.json(list);
});

router.post("/approve/:assetId", auth, async (req, res) => {
  if (!checkGov(req, res)) return;

  const asset = await Asset.findById(req.params.assetId);
  if (!asset) return res.status(404).json({ message: "Asset not found" });

  asset.status = "VERIFIED";
  asset.visibility = "GLOBAL";
  await asset.save();

  await User.findByIdAndUpdate(asset.authorId, { $inc: { points: 10 } });

  res.json({ ok: true, asset });
});

router.post("/reject/:assetId", auth, async (req, res) => {
  if (!checkGov(req, res)) return;

  const asset = await Asset.findById(req.params.assetId);
  if (!asset) return res.status(404).json({ message: "Asset not found" });

  asset.status = "REJECTED";
  await asset.save();

  res.json({ ok: true, asset });
});

module.exports = router;
