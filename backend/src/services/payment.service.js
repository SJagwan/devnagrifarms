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
    const transactionRef = `wd_${crypto.randomUUID().replace(/-/g, '')}`;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: transactionRef,
    };

    const razorpayOrder = await razorpay.orders.create(options);

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

  const transaction = await sequelize.transaction();
  try {
    const payment = await paymentRepository.findByGatewayOrderId(orderId);
    
    if (!payment) {
      await transaction.rollback();
      return true;
    }

    if (payment.status === "pending") {
      await paymentRepository.updatePayment(payment.id, {
        status: "success",
        gateway_payment_id: paymentId,
        method: "razorpay_sync"
      }, transaction);

      await walletService.addFunds(payment.user_id, payment.amount, {
        referenceId: payment.id,
        referenceType: "payment",
        description: `Wallet top-up via Razorpay`,
        metadata: {
          gateway_payment_id: paymentId,
          method: "razorpay_sync"
        },
        transaction
      });
    }

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error("Synchronous Payment Verification Error:", error);
    return true; 
  }
};

/**
 * Process Razorpay Webhook (The ultimate source of truth)
 */
const handleRazorpayWebhook = async (payload, signature) => {
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
      const payment = await paymentRepository.findByGatewayOrderId(orderId);
      if (!payment) {
        await transaction.rollback();
        return { status: "ignored", reason: "Order not found" };
      }

      if (payment.status === "success") {
        await transaction.rollback();
        return { status: "ignored", reason: "Already processed" };
      }

      await paymentRepository.updatePayment(payment.id, {
        status: "success",
        gateway_payment_id: paymentEntity.id,
        method: paymentEntity.method,
        raw_response: payload
      }, transaction);

      await walletService.addFunds(payment.user_id, payment.amount, {
        referenceId: payment.id,
        referenceType: "payment",
        description: `Wallet top-up via Razorpay (${paymentEntity.method})`,
        metadata: {
          gateway_payment_id: paymentEntity.id,
          method: paymentEntity.method,
          email: paymentEntity.email,
          contact: paymentEntity.contact
        },
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
