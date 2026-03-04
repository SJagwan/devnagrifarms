const AppError = require("../utils/AppError");
const crypto = require("crypto");

const verifyCronSecret = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("[WebhookAuth] CRON_SECRET is not defined in environment variables");
    return next(new AppError("Internal Server Error", 500));
  }

  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(secret);

  if (
    tokenBuffer.length !== secretBuffer.length ||
    !crypto.timingSafeEqual(tokenBuffer, secretBuffer)
  ) {
    return next(new AppError("Invalid webhook signature", 403));
  }

  next();
};

module.exports = {
  verifyCronSecret,
};

