const asyncHandler = require("../middlewares/asyncHandler");
const subscriptionService = require("../services/subscription.service");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

const SCHEDULE_MAP = {
  daily: "d",
  alternate: "a",
  weekly: "w",
};

const createSubscription = asyncHandler(async (req, res) => {
  // Map readable schedule to DB code
  const dbValue = {
    ...req.body,
    scheduleType: SCHEDULE_MAP[req.body.scheduleType],
  };

  const subscription = await subscriptionService.createSubscription(
    req.user.id,
    dbValue,
  );

  res.status(201).json({
    success: true,
    data: subscription,
    message: "Subscription created successfully",
  });
});

const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.getUserSubscriptions(
    req.user.id,
  );
  res.json({ success: true, data: subscriptions });
});

const getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getUserSubscriptionById(
    req.params.id,
    req.user.id,
  );
  res.json({ success: true, data: subscription });
});

const pauseSubscription = asyncHandler(async (req, res) => {
  const { pausedUntil } = req.body; // Extract optional pausedUntil date
  const sub = await subscriptionService.pauseSubscription(
    req.user.id,
    req.params.id,
    pausedUntil,
  );
  if (!sub) throw new AppError("Subscription not found", 404);
  res.json({ success: true, message: "Subscription paused" });
});

const resumeSubscription = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.resumeSubscription(
    req.user.id,
    req.params.id,
  );
  if (!sub) throw new AppError("Subscription not found", 404);
  res.json({ success: true, message: "Subscription resumed" });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.cancelSubscription(
    req.user.id,
    req.params.id,
  );
  if (!sub) throw new AppError("Subscription not found", 404);
  res.json({ success: true, message: "Subscription cancelled" });
});

const skipDelivery = asyncHandler(async (req, res) => {
  const { date } = req.body;
  if (!date) throw new AppError("Date is required", 400);

  const dates = await subscriptionService.skipDelivery(
    req.user.id,
    req.params.id,
    date,
  );
  res.json({ success: true, data: dates, message: "Delivery skipped" });
});

const unskipDelivery = asyncHandler(async (req, res) => {
  const { date } = req.body;
  if (!date) throw new AppError("Date is required", 400);

  const dates = await subscriptionService.unskipDelivery(
    req.user.id,
    req.params.id,
    date,
  );
  res.json({ success: true, data: dates, message: "Delivery restored" });
});

// Admin Controllers
const adminGetSubscriptions = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getAllSubscriptions(req.query);
  res.json({ success: true, data: result });
});

const adminGetSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getSubscriptionById(
    req.params.id,
  );
  res.json({ success: true, data: subscription });
});

const adminUpdateStatus = asyncHandler(async (req, res) => {
  const result = await subscriptionService.adminUpdateStatus(
    req.params.id,
    req.body.status,
  );

  res.json({
    success: true,
    data: result,
    message: "Subscription status updated successfully",
  });
});

// Webhook Controllers
const processDailySubscriptions = asyncHandler(async (req, res) => {
  // This is triggered by AWS EventBridge every day (e.g. at 12:00 AM)
  const result = await subscriptionService.processDailySubscriptions();
  logger.info(`[WebhookController] Successfully processed daily subscriptions. Processed: ${result.processed}, Skipped: ${result.skipped}, Failed: ${result.failed}`);

  res.json({
    success: true,
    message: "Daily subscriptions processed successfully",
    data: result,
  });
});
module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  adminGetSubscriptions,
  adminGetSubscriptionById,
  adminUpdateStatus,
  skipDelivery,
  unskipDelivery,
  processDailySubscriptions,
};
