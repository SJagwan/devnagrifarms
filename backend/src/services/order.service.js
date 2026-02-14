const { sequelize } = require("../models");
const orderRepository = require("../repositories/order.repository");
const inventoryRepository = require("../repositories/inventory.repository");
const addressRepository = require("../repositories/address.repository");
const productVariantRepository = require("../repositories/product-variant.repository");
const AppError = require("../utils/AppError");

/**
 * Place a new order
 */
const placeOrder = async (userId, { items, shippingAddressId, deliverySlot, deliveryDate, notes }) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Validate Address
    const address = await addressRepository.getAddressById(shippingAddressId, userId);
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
    const orderItemsData = [];

    for (const item of items) {
      const { variantId, quantity } = item;

      // Fetch Variant Details
      const variant = await productVariantRepository.getVariantById(variantId);
      if (!variant) {
        throw new AppError(`Product variant not found: ${variantId}`, 400);
      }

      if (!variant.is_active) {
        throw new AppError(`Product is currently unavailable: ${variant.sku}`, 400);
      }

      // Check Stock
      const availableStock = await inventoryRepository.getAvailableStock(variantId);
      if (availableStock < quantity) {
        throw new AppError(`Insufficient stock for ${variant.sku}. Available: ${availableStock}`, 400);
      }

      // Reduce Stock (Locking happens inside repository)
      await inventoryRepository.reduceStock(variantId, quantity, transaction);

      // Price Calculation
      const price = parseFloat(variant.price); // Unit Price
      // TODO: Fetch tax percent from Product or Category. For now defaulting to 0 or hardcoded if needed.
      // Assuming variant doesn't hold tax, but we need it. Let's assume 0 for MVP or 5% default.
      const taxPercent = 0; // Placeholder
      const discountPercent = variant.discount_percent || 0;
      
      const lineTotal = price * quantity;
      const taxAmount = (lineTotal * taxPercent) / 100;

      subtotal += lineTotal;
      totalTax += taxAmount;

      orderItemsData.push({
        product_variant_id: variantId,
        quantity,
        price,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        discount_percent: discountPercent,
        total_price: lineTotal + taxAmount, // Storing inclusive or exclusive? Model says total_price. Usually line total.
      });
    }

    const totalPrice = subtotal + totalTax;

    // 3. Create Order
    const orderData = {
      user_id: userId,
      shipping_address_id: shippingAddressId,
      shipping_address_snapshot: shippingAddressSnapshot,
      total_price: totalPrice,
      status: "pending", // Default
      payment_status: "unpaid", // Default
      delivery_slot: deliverySlot || "morning",
      delivery_date: deliveryDate,
      notes,
    };

    const order = await orderRepository.createOrder(orderData, orderItemsData, transaction);

    await transaction.commit();
    return order;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  placeOrder,
};
