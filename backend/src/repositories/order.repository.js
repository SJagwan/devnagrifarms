const { Order, OrderItem, User, ProductVariant, Product } = require("../models");
const { Op } = require("sequelize");

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

const getOrdersPaged = async ({
  page = 1,
  limit = 10,
  status,
  search,
  sortBy,
  sortDir = "DESC",
  userId,
}) => {
  const where = {};

  if (userId) {
    where.user_id = userId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.id = { [Op.like]: `%${search}%` };
  }

  const offset = (page - 1) * limit;
  const order = [[sortBy || "created_at", sortDir]];

  const { rows, count } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    order,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email", "phone"],
      },
    ],
  });

  return { rows, count };
};

const getOrderById = async (id, userId = null) => {
  const where = { id };
  if (userId) {
    where.user_id = userId;
  }

  return await Order.findOne({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email", "phone"],
      },
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: ProductVariant,
            as: "variant",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["name"],
              },
            ],
          },
        ],
      },
    ],
  });
};

const updateOrder = async (id, updateData, transaction) => {
  const [updatedRows] = await Order.update(updateData, {
    where: { id },
    transaction,
  });
  return updatedRows > 0;
};

module.exports = {
  createOrder,
  getOrdersPaged,
  getOrderById,
  updateOrder,
};
