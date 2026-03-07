const { sequelize, User } = require("../models");
const orderRepository = require("../repositories/order.repository");
const inventoryRepository = require("../repositories/inventory.repository");
const addressRepository = require("../repositories/address.repository");
const productVariantRepository = require("../repositories/product-variant.repository");
const walletService = require("./wallet.service");
const AppError = require("../utils/AppError");

/**
 * Shared helper to validate address, check stock, compute taxes, and reduce inventory.
 * Must be executed within a transaction to guarantee atomic inventory reduction.
 */
const _prepareOrderData = async (userId, shippingAddressId, items, transaction) => {
  const address = await addressRepository.getAddressById(
    shippingAddressId,
    userId,
  );
  if (!address) {
    throw new AppError("Shipping address not found or invalid", 400);
  }

  // Fetch the user's phone for the delivery snapshot
  const user = await User.findByPk(userId, {
    attributes: ["phone"],
    transaction,
  });

  const shippingAddressSnapshot = {
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2,
    city: address.city,
    state: address.state,
    country: address.country,
    zip_code: address.zip_code,
    phone: user?.phone || null,
  };

  let subtotal = 0;
  let totalTax = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  const orderItemsData = [];

  for (const item of items) {
    const { variantId, quantity } = item;

    const variant = await productVariantRepository.getVariantById(variantId);
    if (!variant) {
      throw new AppError(`Product variant not found: ${variantId}`, 400);
    }

    if (!variant.is_active) {
      throw new AppError(
        `Product is currently unavailable: ${variant.sku}`,
        400,
      );
    }

    const availableStock = await inventoryRepository.getAvailableStock(variantId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (availableStock < quantity) {
      throw new AppError(
        `Insufficient stock for ${variant.sku}. Available: ${availableStock}`,
        400,
      );
    }

    // Reduces stock via the shared transaction to ensure atomicity
    await inventoryRepository.reduceStock(variantId, quantity, transaction);

    const price = parseFloat(variant.price);
    const taxPercent = parseFloat(variant.product?.default_tax || 0);
    const hsnCode = variant.product?.hsn_code;
    const discountPercent = variant.discount_percent || 0;

    const lineTotal = price * quantity;
    const taxAmount = (lineTotal * taxPercent) / 100;

    // GST Split. Assumption for MVP: Intra-state delivery (50% CGST, 50% SGST, 0% IGST)
    const cgstRate = taxPercent / 2;
    const sgstRate = taxPercent / 2;
    const igstRate = 0;

    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;
    const igstAmount = 0;

    subtotal += lineTotal;
    totalTax += taxAmount;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;

    orderItemsData.push({
      product_variant_id: variantId,
      hsn_code: hsnCode,
      quantity,
      price,
      tax_percent: taxPercent,
      cgst_rate: cgstRate,
      sgst_rate: sgstRate,
      igst_rate: igstRate,
      tax_amount: taxAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      discount_percent: discountPercent,
      total_price: lineTotal + taxAmount,
    });
  }

  const totalPrice = subtotal + totalTax;

  return {
    shippingAddressSnapshot,
    orderItemsData,
    totals: {
      totalPrice,
      totalTax,
      totalCgst,
      totalSgst,
      totalIgst,
    },
  };
};

/**
 * Place a new order. 
 * All orders are strictly wallet-based (prepaid). 
 * If 'online' is selected in frontend, the frontend must top up the wallet first.
 */
const placeOrder = async (
  userId,
  { items, shippingAddressId, deliverySlot, deliveryDate, notes },
  externalTransaction = null,
) => {
  const transaction = externalTransaction || await sequelize.transaction();

  try {
    const {
      shippingAddressSnapshot,
      orderItemsData,
      totals,
    } = await _prepareOrderData(userId, shippingAddressId, items, transaction);

    await walletService.deductFunds(userId, totals.totalPrice, {
      referenceType: "order",
      description: `Payment for order on ${deliveryDate}`,
      transaction,
    });

    const orderData = {
      user_id: userId,
      shipping_address_id: shippingAddressId,
      shipping_address_snapshot: shippingAddressSnapshot,
      total_price: totals.totalPrice,
      total_tax: totals.totalTax,
      cgst_total: totals.totalCgst,
      sgst_total: totals.totalSgst,
      igst_total: totals.totalIgst,
      status: "confirmed",
      payment_status: "paid",
      delivery_slot: deliverySlot || "morning",
      delivery_date: deliveryDate,
      notes,
    };

    const order = await orderRepository.createOrder(
      orderData,
      orderItemsData,
      transaction,
    );

    if (!externalTransaction) await transaction.commit();
    return order;
  } catch (error) {
    if (!externalTransaction) await transaction.rollback();
    throw error;
  }
};

/**
 * Create a specialized order from an automated subscription run
 * Accepts an external transaction from the cron job
 */
const createSubscriptionOrder = async (
  userId,
  subscriptionId,
  { items, shippingAddressId, deliverySlot, deliveryDate, notes },
  externalTransaction
) => {
  if (!externalTransaction) {
    throw new Error("Subscription orders must be run within an existing wallet transaction");
  }

  try {
    const {
      shippingAddressSnapshot,
      orderItemsData,
      totals,
    } = await _prepareOrderData(userId, shippingAddressId, items, externalTransaction);

    const orderData = {
      user_id: userId,
      subscription_id: subscriptionId, // Crucial: Links the order back to its parent subscription
      shipping_address_id: shippingAddressId,
      shipping_address_snapshot: shippingAddressSnapshot,
      total_price: totals.totalPrice,
      total_tax: totals.totalTax,
      cgst_total: totals.totalCgst,
      sgst_total: totals.totalSgst,
      igst_total: totals.totalIgst,
      status: "confirmed", // Cron orders are pre-confirmed
      payment_status: "paid", // Wallet deduction is guaranteed by the wrapping transaction
      delivery_slot: deliverySlot || "morning",
      delivery_date: deliveryDate,
      notes: notes || "Auto-generated subscription order",
    };

    return await orderRepository.createOrder(
      orderData,
      orderItemsData,
      externalTransaction,
    );
  } catch (error) {
    // Note: Do NOT rollback here. The caller (subscription engine) is responsible for rolling back the entire wallet+order process.
    throw error;
  }
};

const getAllOrders = async (query) => {
  const { page = 1, limit = 10, status, search, sortBy, sortDir } = query;

  const { rows, count } = await orderRepository.getOrdersPaged({
    page: Number(page),
    limit: Number(limit),
    status,
    search,
    sortBy,
    sortDir,
  });

  const totalPages = Math.ceil(count / limit) || 1;

  return {
    items: rows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: count,
      totalPages,
    },
  };
};

const getUserOrders = async (userId, query) => {
  const { page = 1, limit = 10, status, sortBy, sortDir } = query || {};

  const { rows, count } = await orderRepository.getOrdersPaged({
    page: Number(page),
    limit: Number(limit),
    status,
    sortBy,
    sortDir,
    userId,
  });

  const totalPages = Math.ceil(count / limit) || 1;

  return {
    items: rows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: count,
      totalPages,
    },
  };
};

const getOrderById = async (id) => {
  const order = await orderRepository.getOrderById(id);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  return order;
};

const getUserOrderById = async (id, userId) => {
  const order = await orderRepository.getOrderById(id, userId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  return order;
};

const updateOrderStatus = async (id, status) => {
  const order = await orderRepository.getOrderById(id);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  await orderRepository.updateOrder(id, { status });
  return { id, status };
};

module.exports = {
  placeOrder,
  createSubscriptionOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  getUserOrderById,
  updateOrderStatus,
};
