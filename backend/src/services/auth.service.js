const { User, RefreshToken } = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/tokens.util");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const createTokens = async (userId, ipAddress = null) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user_id: userId,
    token_hash: tokenHash,
    ip_address: ipAddress,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken };
};

const loginWithPassword = async (phone, password, ipAddress) => {
  const user = await User.findOne({ where: { phone } });
  if (!user || !user.password_hash) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new Error("Invalid credentials");

  return createTokens(user.id, ipAddress);
};

const loginWithOTP = async (phone, otp, ipAddress) => {
  const user = await User.findOne({ where: { phone } });
  if (!user) throw new Error("User not found");

  if (user.otp_code !== otp || user.otp_expires_at < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  return createTokens(user.id, ipAddress);
};

const refreshAccessToken = async (refreshToken, ipAddress) => {
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({
    where: {
      token_hash: tokenHash,
      revoked: false,
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!stored) throw new Error("Invalid or expired refresh token");

  const accessToken = generateAccessToken(stored.user_id);
  return { accessToken };
};

const logoutUser = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.update(
    { revoked: true },
    { where: { token_hash: tokenHash } }
  );
};

module.exports = {
  loginWithPassword,
  loginWithOTP,
  refreshAccessToken,
  logoutUser,
};
