const {
  Subscription,
  SubscriptionItem,
  ProductVariant,
  Product,
  ProductVariantImage,
  User,
  AddressUser,
} = require("../models");
const { Op } = require("sequelize");

const createSubscription = async (subscriptionData, itemsData, transaction) => {
  // Create Parent Subscription
  const subscription = await Subscription.create(subscriptionData, {
    transaction,
  });

  // Create Items
  const itemsWithId = itemsData.map((item) => ({
    ...item,
    subscription_id: subscription.id,
  }));

  await SubscriptionItem.bulkCreate(itemsWithId, { transaction });

  return subscription;
};

const getSubscriptionsByUserId = async (userId) => {
  return await Subscription.findAll({
    where: { user_id: userId },
    include: [
      {
        model: SubscriptionItem,
        as: "items",
        include: [
          {
            model: ProductVariant,
            as: "variant",
            include: [
              { model: Product, as: "product", attributes: ["name"] },
              { model: ProductVariantImage, as: "images" },
            ],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const getSubscriptionById = async (id, userId = null) => {
  const where = { id };
  if (userId) {
    where.user_id = userId;
  }

  return await Subscription.findOne({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email", "phone"],
      },
      {
        model: AddressUser,
        as: "shippingAddress",
      },
      {
        model: SubscriptionItem,
        as: "items",
        include: [
          {
            model: ProductVariant,
            as: "variant",
            include: [
              { model: Product, as: "product", attributes: ["name"] },
              { model: ProductVariantImage, as: "images" },
            ],
          },
        ],
      },
    ],
  });
};

const getSubscriptionsPaged = async ({
  page = 1,
  limit = 10,
  status,
  search,
  sortBy,
  sortDir = "DESC",
  userId,
}) => {
  const where = {};

  if (userId) {
    where.user_id = userId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where[Op.or] = [
      { subscription_name: { [Op.like]: `%${search}%` } },
      { id: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const order = [[sortBy || "created_at", sortDir]];

  const { rows, count } = await Subscription.findAndCountAll({
    where,
    limit,
    offset,
    order,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["first_name", "last_name", "phone"],
      },
      {
        model: AddressUser,
        as: "shippingAddress",
        attributes: ["city"],
      },
    ],
  });

  return { rows, count };
};

const updateSubscriptionStatus = async (
  id,
  userId,
  status,
  pausedUntil = null,
) => {
  const where = { id };
  if (userId) where.user_id = userId; // Optional ownership check

  const subscription = await Subscription.findOne({ where });

  if (!subscription) return null;

  subscription.status = status;
  if (status === "paused") {
    // If paused, set the date (or null for indefinite)
    subscription.paused_until = pausedUntil;
  } else if (status === "active") {
    subscription.paused_until = null;
  }
  await subscription.save();
  return subscription;
};

const updateSkipDates = async (id, userId, skipDates) => {
  const where = { id };
  if (userId) where.user_id = userId;

  const subscription = await Subscription.findOne({ where });
  if (!subscription) return null;

  subscription.skip_dates = skipDates;
  await subscription.save();
  return subscription;
};

const updateSubscription = async (id, updateData) => {
  const [updatedRows] = await Subscription.update(updateData, {
    where: { id },
  });
  return updatedRows > 0;
};

module.exports = {
  createSubscription,
  getSubscriptionsByUserId,
  getSubscriptionById,
  getSubscriptionsPaged,
  updateSubscriptionStatus,
  updateSkipDates,
  updateSubscription,
};
