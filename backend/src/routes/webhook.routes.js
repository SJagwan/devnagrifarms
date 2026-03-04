const express = require("express");
const router = express.Router();
const { verifyCronSecret } = require("../middlewares/webhookAuth");
const subscriptionController = require("../controllers/subscription.controller");

// Secure endpoint triggered by AWS EventBridge
router.post(
  "/process-daily-subscriptions",
  verifyCronSecret,
  subscriptionController.processDailySubscriptions
);

module.exports = router;
