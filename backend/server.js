require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const assetRoutes = require("./src/routes/asset.routes");
const govRoutes = require("./src/routes/gov.routes");
const leaderboardRoutes = require("./src/routes/leaderboard.routes");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, message: "Velion DKN API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/governance", govRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port", process.env.PORT || 5000);
  });
});
