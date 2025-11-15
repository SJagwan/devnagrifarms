const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");

const isAdmin = (req, res, next) => {
  if (req.user.userType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/dashboard/stats", (req, res) => {
  res.json({ success: true, message: "Admin dashboard stats" });
});

module.exports = router;
