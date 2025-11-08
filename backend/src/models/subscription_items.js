"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubscriptionItem extends Model {
    static associate(models) {
      SubscriptionItem.belongsTo(models.Subscription, {
        foreignKey: "subscription_id",
        as: "subscription",
      });
      SubscriptionItem.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id",
        as: "variant",
      });
    }
  }

  SubscriptionItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      subscription_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      product_variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "SubscriptionItem",
      tableName: "subscription_items",
      timestamps: true,
      underscored: true,
    }
  );

  return SubscriptionItem;
};
