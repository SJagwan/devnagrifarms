const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const paymentRepository = require("../repositories/payment.repository");
const walletService = require("./wallet.service");
const AppError = require("../utils/AppError");
const { sequelize } = require("../models");

/**
 * Create a Razorpay Order for adding funds to wallet
 */
const createAddFundsOrder = async (userId, amount) => {
  try {
    // 1. Generate a secure, high-entropy transaction reference (max 40 chars)
    // crypto.randomUUID() generates a 36 char string. We remove dashes to make it 32 chars.
    // Adding 'wd_' makes it 35 chars total, perfectly under the 40 char limit.
    const transactionRef = `wd_${crypto.randomUUID().replace(/-/g, '')}`;

    // 2. Create order in Razorpay
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: transactionRef,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 3. Log payment intent in our DB
    const payment = await paymentRepository.createPayment({
      user_id: userId,
      amount: amount,
      currency: "INR",
      gateway_id: "razorpay",
      gateway_order_id: razorpayOrder.id,
      status: "pending"
    });

    return {
      paymentId: payment.id,
      gatewayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    };
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    throw new AppError("Failed to initiate payment with gateway", 500);
  }
};

/**
 * Verify Razorpay Signature and Sync Wallet (Synchronous check for UI feedback)
 */
const verifySignature = async (orderId, paymentId, signature) => {
  const text = orderId + "|" + paymentId;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest("hex");

  if (generated_signature !== signature) {
    return false;
  }

  // Signature is valid, let's process the payment immediately for instant UI feedback
  const transaction = await sequelize.transaction();
  try {
    const payment = await paymentRepository.findByGatewayOrderId(orderId);
    
    if (!payment) {
      await transaction.rollback();
      return true; // Valid signature, but order not found in our DB (edge case)
    }

    // Idempotency: Only process if it's currently pending
    if (payment.status === "pending") {
      // Update Payment Record
      await paymentRepository.updatePayment(payment.id, {
        status: "success",
        gateway_payment_id: paymentId,
        method: "razorpay_sync" // We don't get the exact method from frontend verify payload, webhook will overwrite this if needed
      }, transaction);

      // Credit Wallet via Ledger
      await walletService.addFunds(payment.user_id, payment.amount, {
        referenceId: payment.id,
        referenceType: "payment",
        description: `Wallet top-up via Razorpay`,
        transaction
      });
    }

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error("Synchronous Payment Verification Error:", error);
    // Return true anyway because the signature WAS valid. 
    // The webhook will retry the ledger update later.
    return true; 
  }
};

/**
 * Process Razorpay Webhook (The ultimate source of truth)
 */
const handleRazorpayWebhook = async (payload, signature) => {
  // 1. Verify Webhook Signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new AppError("Invalid webhook signature", 400);
  }

  const event = payload.event;
  const paymentEntity = payload.payload.payment.entity;
  const orderId = paymentEntity.order_id;

  if (event === "payment.captured") {
    const transaction = await sequelize.transaction();
    try {
      // 2. Find internal payment record
      const payment = await paymentRepository.findByGatewayOrderId(orderId);
      if (!payment) {
        // This might be a direct payment not initiated by our app, or log it
        await transaction.rollback();
        return { status: "ignored", reason: "Order not found" };
      }

      // 3. Idempotency Check: Don't process if already success
      if (payment.status === "success") {
        // Just update raw response if we want, but basically ignore ledger changes
        await transaction.rollback();
        return { status: "ignored", reason: "Already processed" };
      }

      // 4. Update Payment Record
      await paymentRepository.updatePayment(payment.id, {
        status: "success",
        gateway_payment_id: paymentEntity.id,
        method: paymentEntity.method,
        raw_response: payload
      }, transaction);

      // 5. Credit Wallet via Ledger
      await walletService.addFunds(payment.user_id, payment.amount, {
        referenceId: payment.id,
        referenceType: "payment",
        description: `Wallet top-up via Razorpay (${paymentEntity.method})`,
        transaction
      });

      await transaction.commit();
      return { status: "success" };
    } catch (error) {
      await transaction.rollback();
      console.error("Webhook Processing Error:", error);
      throw error;
    }
  }

  return { status: "ignored", event };
};

module.exports = {
  createAddFundsOrder,
  verifySignature,
  handleRazorpayWebhook,
};
