const authService = require("../services/auth.service");

const loginWithPassword = async (req, res) => {
  try {
    const { email, password, user_type } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await authService.loginWithPassword(
      email,
      password,
      user_type,
      req.ip
    );

    if (user_type && result.user.userType !== user_type) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This portal is for ${user_type} users only.`,
      });
    }

    res.json({ success: true, message: "Login successful", ...result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const loginWithOTP = async (req, res) => {
  try {
    const { phone, otp, user_type } = req.body;
    const tokens = await authService.loginWithOTP(
      phone,
      otp,
      user_type,
      req.ip
    );

    if (user_type && tokens.user.userType !== user_type) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This portal is for ${user_type} users only.`,
      });
    }

    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const token = await authService.refreshAccessToken(refreshToken, req.ip);
    res.json({ success: true, ...token });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const requestOTP = async (req, res) => {
  try {
    const { phone, user_type } = req.body;
    if (!phone || !user_type) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Phone number and user type are required",
        });
    }
    await authService.requestOTP(phone, user_type);
    // In dev, we might want to return the OTP in the response for testing
    // In prod, this should strictly only send SMS
    res.json({
      success: true,
      message: "OTP sent successfully",
      // dev_otp: otp // specific for testing if needed
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginWithPassword,
  loginWithOTP,
  refreshToken,
  logout,
  getCurrentUser,
  requestOTP,
};
