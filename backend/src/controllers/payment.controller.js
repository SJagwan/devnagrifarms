const asyncHandler = require("../middlewares/asyncHandler");
const paymentService = require("../services/payment.service");

const createAddFundsOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  const result = await paymentService.createAddFundsOrder(req.user.id, amount);
  res.json({
    success: true,
    data: result,
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const isValid = await paymentService.verifySignature(
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature
  );

  if (isValid) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid payment signature" });
  }
});

const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const result = await paymentService.handleRazorpayWebhook(req.body, signature);
  
  res.json({
    success: true,
    data: result
  });
});

module.exports = {
  createAddFundsOrder,
  verifyPayment,
  handleRazorpayWebhook,
};
