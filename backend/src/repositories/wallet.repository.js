const { WalletTransaction, User, Sequelize } = require("../models");
const { Op } = Sequelize;

/**
 * Create a new wallet transaction record
 */
const createTransaction = async (data, transaction) => {
  return await WalletTransaction.create(data, { transaction });
};

/**
 * Get user's wallet transactions with pagination
 */
const getTransactionsPaged = async (userId, { page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  
  const { rows, count } = await WalletTransaction.findAndCountAll({
    where: { user_id: userId },
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { rows, count };
};

/**
 * Get user balance with a row-level lock
 * Critical for preventing race conditions during concurrent updates
 */
const getBalanceForUpdate = async (userId, transaction) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "wallet_balance"],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  return user;
};

/**
 * Update the user's wallet balance
 */
const updateBalance = async (userId, newBalance, transaction) => {
  return await User.update(
    { wallet_balance: newBalance },
    { where: { id: userId }, transaction }
  );
};

module.exports = {
  createTransaction,
  getTransactionsPaged,
  getBalanceForUpdate,
  updateBalance,
};
