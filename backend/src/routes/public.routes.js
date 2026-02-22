const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.get("/ping", (req, res) => res.send("pong"));

// Webhooks
router.post("/webhooks/razorpay", paymentController.handleRazorpayWebhook);

module.exports = router;
