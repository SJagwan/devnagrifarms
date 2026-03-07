const Joi = require("joi");

const createOrder = {
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
    deliverySlot: Joi.string().valid("morning", "evening").required(),
    deliveryDate: Joi.date().iso().min("now").required(),
    notes: Joi.string().allow("", null),
    paymentMethod: Joi.string().valid("wallet", "online").required(),
  }),
};

const updateStatus = {
  body: Joi.object({
    status: Joi.string()
      .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
      .required(),
  }),
};

module.exports = {
  createOrder,
  updateStatus,
};
