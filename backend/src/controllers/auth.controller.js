const authService = require("../services/auth.service");

const loginWithPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const tokens = await authService.loginWithPassword(phone, password, req.ip);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const loginWithOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const tokens = await authService.loginWithOTP(phone, otp, req.ip);
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

module.exports = {
  loginWithPassword,
  loginWithOTP,
  refreshToken,
  logout,
};
