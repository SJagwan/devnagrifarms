const Joi = require("joi");
const asyncHandler = require("../middlewares/asyncHandler");
const orderService = require("../services/order.service");
const AppError = require("../utils/AppError");

const createOrder = asyncHandler(async (req, res) => {
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
    deliverySlot: Joi.string().valid("morning", "evening").required(),
    deliveryDate: Joi.date().iso().min("now").required(),
    notes: Joi.string().allow("", null),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const order = await orderService.placeOrder(req.user.id, value);

  res.status(201).json({
    success: true,
    data: order,
    message: "Order placed successfully",
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  res.json({ success: true, data: result });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json({ success: true, data: order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
      .required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const result = await orderService.updateOrderStatus(req.params.id, value.status);

  res.json({
    success: true,
    data: result,
    message: "Order status updated successfully",
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatus,
};
