const { Payment } = require("../models");

const createPayment = async (data, transaction) => {
  return await Payment.create(data, { transaction });
};

const updatePayment = async (id, updateData, transaction) => {
  return await Payment.update(updateData, {
    where: { id },
    transaction,
  });
};

const findByGatewayOrderId = async (gatewayOrderId) => {
  return await Payment.findOne({
    where: { gateway_order_id: gatewayOrderId },
  });
};

const getPaymentById = async (id) => {
  return await Payment.findByPk(id);
};

module.exports = {
  createPayment,
  updatePayment,
  findByGatewayOrderId,
  getPaymentById,
};
