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
    const address = await addressRepository.getAddressById(
      shippingAddressId,
      userId,
    );
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
      if (!variant.is_active)
        throw new AppError(`Product unavailable: ${variant.sku}`, 400);

      // Construct name (e.g. "Milk Standard - 500ml")
      if (!subscriptionName) {
        subscriptionName = `${variant.product?.name || "Product"} (${quantity} ${variant.unit})`;
      } else {
        subscriptionName += " + others"; // If we support multi-item later
      }

      const price = parseFloat(variant.price);
      const taxPercent = parseFloat(variant.product?.default_tax || 0);
      const hsnCode = variant.product?.hsn_code;
      const discountPercent = variant.discount_percent || 0;

      const taxAmount = (price * taxPercent) / 100;
      const cgstRate = taxPercent / 2;
      const sgstRate = taxPercent / 2;
      const igstRate = 0;

      const cgstAmount = taxAmount / 2;
      const sgstAmount = taxAmount / 2;
      const igstAmount = 0;

      subscriptionItemsData.push({
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
      transaction,
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
  const subscription = await subscriptionRepository.getSubscriptionById(
    id,
    userId,
  );
  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }
  return subscription;
};

const pauseSubscription = async (
  userId,
  subscriptionId,
  pausedUntil = null,
) => {
  if (pausedUntil) {
    const pauseDate = new Date(pausedUntil);
    const now = new Date();
    // Validate cutoff (e.g. > 12 hours) - implementing simple check for future date
    if (pauseDate <= now) {
      throw new AppError("Pause date must be in the future", 400);
    }
  }

  return await subscriptionRepository.updateSubscriptionStatus(
    subscriptionId,
    userId,
    "paused",
    pausedUntil,
  );
};

const resumeSubscription = async (userId, subscriptionId) => {
  const subscription = await subscriptionRepository.getSubscriptionById(
    subscriptionId,
    userId,
  );
  if (!subscription) throw new AppError("Subscription not found", 404);

  if (subscription.status === "cancelled") {
    throw new AppError("Cannot resume a cancelled subscription", 400);
  }

  return await subscriptionRepository.updateSubscriptionStatus(
    subscriptionId,
    userId,
    "active",
  );
};

const cancelSubscription = async (userId, subscriptionId) => {
  return await subscriptionRepository.updateSubscriptionStatus(
    subscriptionId,
    userId,
    "cancelled",
  );
};

const skipDelivery = async (userId, subscriptionId, date) => {
  const subscription = await subscriptionRepository.getSubscriptionById(
    subscriptionId,
    userId,
  );
  if (!subscription) throw new AppError("Subscription not found", 404);

  // Validate Date Cutoff (12 hours)
  // Assumes date string is YYYY-MM-DD.
  const targetDate = new Date(date); // UTC Midnight

  // Adjust target time based on slot to allow more accurate cutoff
  // Morning (approx 7 AM IST -> 01:30 UTC): Add 2 hours to be safe/approx
  // Evening (approx 6 PM IST -> 12:30 UTC): Add 11 hours
  if (subscription.delivery_slot === "evening") {
    targetDate.setHours(11);
  } else {
    targetDate.setHours(2);
  }

  const now = new Date();
  const diffHours = (targetDate - now) / 1000 / 60 / 60;

  if (diffHours < 12) {
    throw new AppError("Cannot skip delivery less than 12 hours before", 400);
  }

  let skipDates = subscription.skip_dates || [];
  if (!skipDates.includes(date)) {
    skipDates.push(date);
    await subscriptionRepository.updateSkipDates(
      subscriptionId,
      userId,
      skipDates,
    );
  }

  return skipDates;
};

const unskipDelivery = async (userId, subscriptionId, date) => {
  const subscription = await subscriptionRepository.getSubscriptionById(
    subscriptionId,
    userId,
  );
  if (!subscription) throw new AppError("Subscription not found", 404);

  // Validate Date Cutoff (12 hours) - restoring also needs notice or maybe not?
  // Let's enforce 12h for consistency so logistics can handle it.
  const targetDate = new Date(date);

  if (subscription.delivery_slot === "evening") {
    targetDate.setHours(11);
  } else {
    targetDate.setHours(2);
  }

  const now = new Date();
  const diffHours = (targetDate - now) / 1000 / 60 / 60;

  if (diffHours < 12) {
    throw new AppError(
      "Cannot restore delivery less than 12 hours before",
      400,
    );
  }

  let skipDates = subscription.skip_dates || [];
  if (skipDates.includes(date)) {
    skipDates = skipDates.filter((d) => d !== date);
    await subscriptionRepository.updateSkipDates(
      subscriptionId,
      userId,
      skipDates,
    );
  }

  return skipDates;
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
  skipDelivery,
  unskipDelivery,
};
