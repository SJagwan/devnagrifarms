const Joi = require("joi");
const asyncHandler = require("../middlewares/asyncHandler");
const subscriptionService = require("../services/subscription.service");
const AppError = require("../utils/AppError");

const SCHEDULE_MAP = {
  daily: "d",
  alternate: "a",
  weekly: "w",
};

const createSubscription = asyncHandler(async (req, res) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          variantId: Joi.string().uuid().required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .min(1)
      .required(),
    shippingAddressId: Joi.string().uuid().required(),
    scheduleType: Joi.string().valid("daily", "alternate", "weekly").required(),
    startDate: Joi.date().iso().min("now").required(),
    deliverySlot: Joi.string().valid("morning", "evening").required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  // Map readable schedule to DB code
  const dbValue = {
    ...value,
    scheduleType: SCHEDULE_MAP[value.scheduleType],
  };

  const subscription = await subscriptionService.createSubscription(
    req.user.id,
    dbValue
  );

  res.status(201).json({
    success: true,
    data: subscription,
    message: "Subscription created successfully",
  });
});

const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.getUserSubscriptions(req.user.id);
  res.json({ success: true, data: subscriptions });
});

const pauseSubscription = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.pauseSubscription(req.user.id, req.params.id);
  if (!sub) throw new AppError("Subscription not found", 404);
  res.json({ success: true, message: "Subscription paused" });
});

const resumeSubscription = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.resumeSubscription(req.user.id, req.params.id);
  if (!sub) throw new AppError("Subscription not found", 404);
  res.json({ success: true, message: "Subscription resumed" });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.cancelSubscription(req.user.id, req.params.id);
  if (!sub) throw new AppError("Subscription not found", 404);
  res.json({ success: true, message: "Subscription cancelled" });
});

module.exports = {
  createSubscription,
  getSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
};
