const asyncHandler = require("../middlewares/asyncHandler");
const orderService = require("../services/order.service");

const createOrder = asyncHandler(async (req, res) => {
  // Both 'wallet' and 'online' payment methods are processed as prepaid 
  // wallet deductions by the OrderService.
  const order = await orderService.placeOrder(req.user.id, req.body);

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

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user.id, req.query);
  res.json({ success: true, data: result });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getUserOrderById(req.params.id, req.user.id);
  res.json({ success: true, data: order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await orderService.updateOrderStatus(req.params.id, req.body.status);

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
  getMyOrders,
  getMyOrderById,
  updateStatus,
};
