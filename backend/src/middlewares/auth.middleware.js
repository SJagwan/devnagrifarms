const { verifyAccessToken } = require("../utils/token.util");
const { findUserById } = require("../repositories/user.repository");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authenticate };
