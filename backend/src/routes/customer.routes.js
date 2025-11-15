const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");

const isCustomer = (req, res, next) => {
  if (req.user.userType !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Customer only.",
    });
  }
  next();
};

router.use(authenticate, isCustomer);

router.get("/profile", (req, res) => {
  res.json({ success: true, message: "Get customer profile" });
});

module.exports = router;
