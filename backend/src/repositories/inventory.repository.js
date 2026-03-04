const { Inventory, ProductVariant } = require("../models");
const { Op } = require("sequelize");

// Checks stock across all warehouses
const getAvailableStock = async (variantId, options = {}) => {
  const inventory = await Inventory.findAll({
    where: { product_variant_id: variantId },
    ...options
  });

  const totalQuantity = inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalReserved = inventory.reduce(
    (sum, item) => sum + Number(item.reserved_quantity || 0),
    0
  );

  return totalQuantity - totalReserved;
};

// Simple FIFO stock reduction. In a multi-warehouse setup, this requires specific warehouse selection logic.
const reduceStock = async (variantId, quantity, transaction) => {
  const inventoryRecords = await Inventory.findAll({
    where: {
      product_variant_id: variantId,
      quantity: { [Op.gt]: 0 },
    },
    transaction,
    lock: transaction.LOCK.UPDATE, // Lock rows to prevent race conditions
  });

  let remainingToDeduct = Number(quantity);

  for (const record of inventoryRecords) {
    if (remainingToDeduct <= 0) break;

    const availableInRecord = Number(record.quantity || 0) - Number(record.reserved_quantity || 0);

    if (availableInRecord > 0) {
      const deduction = Math.min(availableInRecord, remainingToDeduct);
      
      // Note: Directly reducing quantity for MVP flow.
      // A "Reserve then Confirm" flow would increment reserved_quantity instead.
      await record.decrement("quantity", { by: deduction, transaction });
      
      remainingToDeduct -= deduction;
    }
  }

  if (remainingToDeduct > 0) {
    throw new Error(`Insufficient stock for variant ${variantId}`);
  }

  return true;
};

module.exports = {
  getAvailableStock,
  reduceStock,
};
