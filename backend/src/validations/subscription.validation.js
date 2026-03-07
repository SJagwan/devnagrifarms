const Joi = require("joi");

const createSubscription = {
  body: Joi.object({
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
  }),
};

const adminUpdateStatus = {
  body: Joi.object({
    status: Joi.string().valid("active", "paused", "cancelled").required(),
  }),
};

module.exports = {
  createSubscription,
  adminUpdateStatus,
};
