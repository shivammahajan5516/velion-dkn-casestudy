const crypto = require("crypto");

module.exports = function sha256FromString(s) {
  return crypto.createHash("sha256").update(String(s)).digest("hex");
};
