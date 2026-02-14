const { sequelize } = require("../models");
const subscriptionRepository = require("../repositories/subscription.repository");
const addressRepository = require("../repositories/address.repository");
const productVariantRepository = require("../repositories/product-variant.repository");
const AppError = require("../utils/AppError");

const createSubscription = async (userId, data) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      shippingAddressId,
      items,
      scheduleType, // 'daily', 'alternate', 'weekly'
      startDate,
      deliverySlot,
    } = data;

    // 1. Validate Address
    const address = await addressRepository.getAddressById(shippingAddressId, userId);
    if (!address) {
      throw new AppError("Shipping address not found", 400);
    }

    // 2. Process Items
    const subscriptionItemsData = [];
    let subscriptionName = "";

    for (const item of items) {
      const { variantId, quantity } = item;
      const variant = await productVariantRepository.getVariantById(variantId);
      
      if (!variant) throw new AppError(`Variant not found: ${variantId}`, 400);
      if (!variant.is_active) throw new AppError(`Product unavailable: ${variant.sku}`, 400);

      // Construct name (e.g. "Milk Standard - 500ml")
      if (!subscriptionName) {
        subscriptionName = `${variant.product?.name || "Product"} (${quantity} ${variant.unit})`;
      } else {
        subscriptionName += " + others"; // If we support multi-item later
      }

      subscriptionItemsData.push({
        product_variant_id: variantId,
        quantity,
        price: variant.price, // Lock price at start? Or fetch current? Typically lock or link. Using current price.
        tax_percent: 0, // Placeholder
        discount_percent: variant.discount_percent || 0,
      });
    }

    // 3. Create Subscription Record
    const subscriptionData = {
      user_id: userId,
      shipping_address_id: shippingAddressId,
      subscription_name: subscriptionName,
      status: "active",
      start_date: startDate,
      schedule_type: scheduleType,
      delivery_slot: deliverySlot || "morning",
    };

    const subscription = await subscriptionRepository.createSubscription(
      subscriptionData,
      subscriptionItemsData,
      transaction
    );

    await transaction.commit();
    return subscription;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserSubscriptions = async (userId) => {
  return await subscriptionRepository.getSubscriptionsByUserId(userId);
};

const getUserSubscriptionById = async (id, userId) => {
  const subscription = await subscriptionRepository.getSubscriptionById(id, userId);
  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }
  return subscription;
};

const pauseSubscription = async (userId, subscriptionId) => {
  return await subscriptionRepository.updateSubscriptionStatus(
    subscriptionId,
    userId,
    "paused"
  );
};

const resumeSubscription = async (userId, subscriptionId) => {
  return await subscriptionRepository.updateSubscriptionStatus(
    subscriptionId,
    userId,
    "active"
  );
};

const cancelSubscription = async (userId, subscriptionId) => {
  return await subscriptionRepository.updateSubscriptionStatus(
    subscriptionId,
    userId,
    "cancelled"
  );
};

// Admin Methods
const getAllSubscriptions = async (query) => {
  const { page = 1, limit = 10, status, search, sortBy, sortDir } = query;

  const { rows, count } = await subscriptionRepository.getSubscriptionsPaged({
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

const getSubscriptionById = async (id) => {
  const subscription = await subscriptionRepository.getSubscriptionById(id);
  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }
  return subscription;
};

const adminUpdateStatus = async (id, status) => {
  const subscription = await subscriptionRepository.getSubscriptionById(id);
  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }
  // No user check for admin
  await subscriptionRepository.updateSubscriptionStatus(id, null, status);
  return { id, status };
};

module.exports = {
  createSubscription,
  getUserSubscriptions,
  getUserSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  adminUpdateStatus,
};
