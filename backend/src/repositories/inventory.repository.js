const { Inventory, ProductVariant } = require("../models");
const { Op } = require("sequelize");

// Check if sufficient stock exists across all warehouses
// Returns total available quantity
const getAvailableStock = async (variantId) => {
  const inventory = await Inventory.findAll({
    where: { product_variant_id: variantId },
  });

  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalReserved = inventory.reduce(
    (sum, item) => sum + item.reserved_quantity,
    0
  );

  return totalQuantity - totalReserved;
};

// Reduce stock (simple FIFO or just pick first warehouse for MVP)
// In a real app, this would select specific warehouse logic.
const reduceStock = async (variantId, quantity, transaction) => {
  // Find inventory records for this variant with available stock
  const inventoryRecords = await Inventory.findAll({
    where: {
      product_variant_id: variantId,
      quantity: { [Op.gt]: 0 },
    },
    transaction,
    lock: transaction.LOCK.UPDATE, // Lock rows to prevent race conditions
  });

  let remainingToDeduct = quantity;

  for (const record of inventoryRecords) {
    if (remainingToDeduct <= 0) break;

    const availableInRecord = record.quantity - record.reserved_quantity;

    if (availableInRecord > 0) {
      const deduction = Math.min(availableInRecord, remainingToDeduct);
      
      // Decrease quantity (Sold)
      // Note: We are directly reducing quantity for MVP flow.
      // If we supported "Reserve then Confirm", we would inc reserved_quantity.
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
