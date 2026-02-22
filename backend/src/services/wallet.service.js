const { sequelize } = require("../models");
const walletRepository = require("../repositories/wallet.repository");
const AppError = require("../utils/AppError");

/**
 * Common private method to handle balance updates and transaction logging
 */
const _updateUserWallet = async (userId, amount, type, { referenceId, referenceType, description, transaction: existingTransaction }) => {
  const transaction = existingTransaction || await sequelize.transaction();

  try {
    // 1. Get current balance with lock
    const user = await walletRepository.getBalanceForUpdate(userId, transaction);
    if (!user) throw new AppError("User not found", 404);

    const currentBalance = parseFloat(user.wallet_balance);
    const newBalance = currentBalance + parseFloat(amount);

    // 2. Safety check for debits
    if (newBalance < 0) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    // 3. Create Transaction Record
    await walletRepository.createTransaction({
      user_id: userId,
      amount: Math.abs(amount), // store absolute value, type defines direction
      type, // 'deposit', 'purchase', 'refund', 'adjustment'
      balance_after: newBalance,
      reference_id: referenceId,
      reference_type: referenceType,
      description
    }, transaction);

    // 4. Update User Balance
    await walletRepository.updateBalance(userId, newBalance, transaction);

    if (!existingTransaction) await transaction.commit();
    
    return { balance: newBalance };
  } catch (error) {
    if (!existingTransaction) await transaction.rollback();
    throw error;
  }
};

/**
 * Credit funds to user wallet
 */
const addFunds = async (userId, amount, { referenceId, referenceType, description, transaction }) => {
  return await _updateUserWallet(userId, amount, "deposit", { referenceId, referenceType, description, transaction });
};

/**
 * Debit funds from user wallet
 */
const deductFunds = async (userId, amount, { referenceId, referenceType, description, transaction }) => {
  return await _updateUserWallet(userId, -amount, "purchase", { referenceId, referenceType, description, transaction });
};

/**
 * Refund funds to user wallet
 */
const refundFunds = async (userId, amount, { referenceId, referenceType, description, transaction }) => {
  return await _updateUserWallet(userId, amount, "refund", { referenceId, referenceType, description, transaction });
};

/**
 * Admin manual adjustment
 */
const manualAdjustment = async (userId, amount, description, adminId) => {
  return await _updateUserWallet(userId, amount, "adjustment", { 
    description: `[Manual ADJ by Admin ${adminId}] ${description}`
  });
};

/**
 * Get user passbook history
 */
const getPassbook = async (userId, query) => {
  const { page = 1, limit = 10 } = query;
  const { rows, count } = await walletRepository.getTransactionsPaged(userId, { page, limit });
  
  return {
    items: rows,
    meta: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      page: Number(page),
      limit: Number(limit)
    }
  };
};

module.exports = {
  addFunds,
  deductFunds,
  refundFunds,
  manualAdjustment,
  getPassbook,
};
