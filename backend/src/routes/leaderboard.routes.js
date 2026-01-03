const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  const top = await User.find().select("name email points region").sort({ points: -1 }).limit(10);
  res.json(top);
});

module.exports = router;
