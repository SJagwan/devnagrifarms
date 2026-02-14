const { Subscription, SubscriptionItem, ProductVariant, Product, ProductVariantImage } = require("../models");

const createSubscription = async (subscriptionData, itemsData, transaction) => {
  // Create Parent Subscription
  const subscription = await Subscription.create(subscriptionData, { transaction });

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
              { model: ProductVariantImage, as: "images" }
            ],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const getSubscriptionById = async (id, userId) => {
  return await Subscription.findOne({
    where: { id, user_id: userId },
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
              { model: ProductVariantImage, as: "images" }
            ],
          },
        ],
      },
    ],
  });
};

const updateSubscriptionStatus = async (id, userId, status) => {
  const subscription = await Subscription.findOne({
    where: { id, user_id: userId },
  });

  if (!subscription) return null;

  subscription.status = status;
  await subscription.save();
  return subscription;
};

module.exports = {
  createSubscription,
  getSubscriptionsByUserId,
  getSubscriptionById,
  updateSubscriptionStatus,
};
