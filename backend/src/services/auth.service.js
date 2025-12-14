const { RefreshToken, User } = require("../models");
const bcrypt = require("bcrypt");

const {
  findUserForAuth,
  findUserById,
  createUser,
} = require("../repositories/user.repository");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token.util");

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

const loginWithPassword = async (email, password, user_type, ipAddress) => {
  const user = await findUserForAuth(email, user_type);

  if (!user || !user.password_hash) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new Error("Invalid credentials");

  return {
    ...(await createTokens(user.id, ipAddress)),
    user: {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      userType: user.user_type,
    },
  };
};

const loginWithOTP = async (phone, otp, userType = null, ipAddress) => {
  const user = await findUserForAuth(phone, userType);

  if (!user) {
    throw new Error("User not found or invalid phone number");
  }

  // Check OTP
  if (
    !user.otp_code ||
    user.otp_code !== otp ||
    !user.otp_expires_at ||
    new Date() > user.otp_expires_at
  ) {
    throw new Error("Invalid or expired OTP");
  }

  // Clear OTP
  user.otp_code = null;
  user.otp_expires_at = null;

  // Mark phone as verified if not already
  if (!user.phone_verified_at) {
    user.phone_verified_at = new Date();
  }

  await user.save();

  // Generate tokens
  return {
    ...(await createTokens(user.id, ipAddress)),
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.first_name
        ? `${user.first_name} ${user.last_name}`.trim()
        : "Customer",
      userType: user.user_type,
    },
  };
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

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    status: user.status,
  };
};

const requestOTP = async (phone, userType) => {
  if (!userType) throw new Error("User type is required");

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check if user exists
  let user = await findUserForAuth(phone);

  if (user) {
    // Update existing user
    user.otp_code = otp;
    user.otp_expires_at = otpExpiresAt;
    await user.save();
  } else {
    // Create new user with specified type
    user = await createUser({
      phone,
      otp_code: otp,
      otp_expires_at: otpExpiresAt,
      user_type: userType,
      status: "active",
      // email and password_hash are null
    });
  }

  // TODO: Integrate SMS gateway here
  console.log(`[DEV] OTP for ${phone}: ${otp}`);

  return { phone, message: "OTP sent" };
};

module.exports = {
  loginWithPassword,
  loginWithOTP,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  requestOTP,
};
