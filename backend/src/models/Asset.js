const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    hash: { type: String, required: true, unique: true },

    status: { type: String, enum: ["PENDING", "VERIFIED", "REJECTED"], default: "PENDING" },
    visibility: { type: String, enum: ["PRIVATE", "GLOBAL"], default: "PRIVATE" },

    storageLocation: { type: String, enum: ["EU_SERVER", "GLOBAL_SERVER"], default: "EU_SERVER" },

    // Document upload not included (your requirement). Use URL/TEXT.
    sourceType: { type: String, enum: ["URL", "TEXT"], default: "URL" },
    sourceValue: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", AssetSchema);
