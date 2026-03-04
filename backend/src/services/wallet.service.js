const { sequelize } = require("../models");
const walletRepository = require("../repositories/wallet.repository");
const AppError = require("../utils/AppError");

/**
 * Handles balance updates and transaction logging.
 * Atomic and protected by row-level locking.
 */
const _updateUserWallet = async (
  userId,
  amount,
  type,
  { referenceId, referenceType, metadata, description, transaction: existingTransaction },
) => {
  const transaction = existingTransaction || (await sequelize.transaction());

  try {
    const user = await walletRepository.getBalanceForUpdate(
      userId,
      transaction,
    );
    if (!user) throw new AppError("User not found", 404);

    const currentBalance = parseFloat(user.wallet_balance);
    const newBalance = currentBalance + parseFloat(amount);

    if (newBalance < 0) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    const direction = amount >= 0 ? "credit" : "debit";

    await walletRepository.createTransaction(
      {
        user_id: userId,
        amount: Math.abs(amount), // Store absolute value; direction defines polarity
        direction,
        type,
        balance_after: newBalance,
        reference_id: referenceId,
        reference_type: referenceType,
        metadata,
        description,
      },
      transaction,
    );

    await walletRepository.updateBalance(userId, newBalance, transaction);

    if (!existingTransaction) await transaction.commit();

    return { balance: newBalance };
  } catch (error) {
    if (!existingTransaction) await transaction.rollback();
    throw error;
  }
};

const addFunds = async (
  userId,
  amount,
  { referenceId, referenceType, metadata, description, transaction },
) => {
  return await _updateUserWallet(userId, amount, "deposit", {
    referenceId,
    referenceType,
    metadata,
    description,
    transaction,
  });
};

const deductFunds = async (
  userId,
  amount,
  { referenceId, referenceType, metadata, description, transaction },
) => {
  return await _updateUserWallet(userId, -amount, "purchase", {
    referenceId,
    referenceType,
    metadata,
    description,
    transaction,
  });
};

const refundFunds = async (
  userId,
  amount,
  { referenceId, referenceType, metadata, description, transaction },
) => {
  return await _updateUserWallet(userId, amount, "refund", {
    referenceId,
    referenceType,
    metadata,
    description,
    transaction,
  });
};

const manualAdjustment = async (userId, amount, description, adminId) => {
  return await _updateUserWallet(userId, amount, "adjustment", {
    description: `[Manual ADJ by Admin ${adminId}] ${description}`,
    metadata: { admin_id: adminId },
  });
};

const getPassbook = async (userId, query) => {
  const { page = 1, limit = 10 } = query;
  const { rows, count } = await walletRepository.getTransactionsPaged(userId, {
    page,
    limit,
  });

  return {
    items: rows,
    meta: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      page: Number(page),
      limit: Number(limit),
    },
  };
};

const getAllTransactions = async (query) => {
  const { page = 1, limit = 10, type, userId } = query;
  const { rows, count } = await walletRepository.getAllTransactionsPaged({
    page,
    limit,
    type,
    userId,
  });

  return {
    items: rows,
    meta: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      page: Number(page),
      limit: Number(limit),
    },
  };
};

module.exports = {
  addFunds,
  deductFunds,
  refundFunds,
  manualAdjustment,
  getPassbook,
  getAllTransactions,
};
