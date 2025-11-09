const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/config");

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
  });

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
};
