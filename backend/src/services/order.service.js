const { sequelize } = require("../models");
const orderRepository = require("../repositories/order.repository");
const inventoryRepository = require("../repositories/inventory.repository");
const addressRepository = require("../repositories/address.repository");
const productVariantRepository = require("../repositories/product-variant.repository");
const AppError = require("../utils/AppError");

/**
 * Place a new order
 */
const placeOrder = async (
  userId,
  { items, shippingAddressId, deliverySlot, deliveryDate, notes },
) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Validate Address
    const address = await addressRepository.getAddressById(
      shippingAddressId,
      userId,
    );
    if (!address) {
      throw new AppError("Shipping address not found or invalid", 400);
    }

    // Snapshot of address for the order record
    const shippingAddressSnapshot = {
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      state: address.state,
      country: address.country,
      zip_code: address.zip_code,
      phone: address.phone, // Assuming phone might be in address or user
    };

    // 2. Process Items & Calculate Totals
    let subtotal = 0;
    let totalTax = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { variantId, quantity } = item;

      // Fetch Variant Details (now includes Product via updated repository)
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

      // Check Stock
      const availableStock =
        await inventoryRepository.getAvailableStock(variantId);
      if (availableStock < quantity) {
        throw new AppError(
          `Insufficient stock for ${variant.sku}. Available: ${availableStock}`,
          400,
        );
      }

      // Reduce Stock (Locking happens inside repository)
      await inventoryRepository.reduceStock(variantId, quantity, transaction);

      // Price Calculation
      const price = parseFloat(variant.price); // Unit Price
      const taxPercent = parseFloat(variant.product?.default_tax || 0);
      const hsnCode = variant.product?.hsn_code;
      const discountPercent = variant.discount_percent || 0;

      const lineTotal = price * quantity;
      const taxAmount = (lineTotal * taxPercent) / 100;

      // GST Split (Assuming Intra-state: 50/50 split between CGST and SGST)
      const cgstRate = taxPercent / 2;
      const sgstRate = taxPercent / 2;
      const igstRate = 0; // Assuming Intra-state for MVP

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

    // 3. Create Order
    const orderData = {
      user_id: userId,
      shipping_address_id: shippingAddressId,
      shipping_address_snapshot: shippingAddressSnapshot,
      total_price: totalPrice,
      total_tax: totalTax,
      cgst_total: totalCgst,
      sgst_total: totalSgst,
      igst_total: totalIgst,
      status: "pending", // Default
      payment_status: "unpaid", // Default
      delivery_slot: deliverySlot || "morning",
      delivery_date: deliveryDate,
      notes,
    };

    const order = await orderRepository.createOrder(
      orderData,
      orderItemsData,
      transaction,
    );

    await transaction.commit();
    return order;
  } catch (error) {
    await transaction.rollback();
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

  // TODO: Add valid status transitions state machine check here if needed
  // e.g. pending -> confirmed -> delivered

  await orderRepository.updateOrder(id, { status });
  return { id, status };
};

module.exports = {
  placeOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  getUserOrderById,
  updateOrderStatus,
};
