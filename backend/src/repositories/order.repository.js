const { Order, OrderItem } = require("../models");

const createOrder = async (orderData, itemsData, transaction) => {
  // Create the main order record
  const order = await Order.create(orderData, { transaction });

  // Prepare items with the generated order_id
  const itemsWithOrderId = itemsData.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  // Bulk create order items
  await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

  return order;
};

module.exports = {
  createOrder,
};
