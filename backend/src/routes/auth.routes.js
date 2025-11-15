const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

router.post("/login", authController.loginWithPassword);
router.post("/login/otp", authController.loginWithOTP);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);

module.exports = router;
