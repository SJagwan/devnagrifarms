const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const customerRoutes = require("./customer.routes");
const publicRoutes = require("./public.routes");

router.use("/public", publicRoutes);

router.use("/auth", authRoutes);

router.use("/admin", adminRoutes);
router.use("/customer", customerRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
