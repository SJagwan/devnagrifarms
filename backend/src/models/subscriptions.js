"use strict";
const { Model } = require("sequelize");

const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
};

const SCHEDULE_TYPE = {
  DAILY: "d",
  ALTERNATE: "a",
  WEEKLY: "w",
  CUSTOM: "c",
};

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "user",
      });
      Subscription.belongsTo(models.AddressUser, {
        foreignKey: "shipping_address_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        as: "shippingAddress",
      });
      Subscription.hasMany(models.SubscriptionItem, {
        foreignKey: "subscription_id",
        as: "items",
      });
      Subscription.hasMany(models.Order, {
        foreignKey: "subscription_id",
        as: "orders",
      });
    }
  }

  Subscription.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      shipping_address_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      subscription_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SUBSCRIPTION_STATUS)),
        allowNull: false,
        defaultValue: SUBSCRIPTION_STATUS.ACTIVE,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      schedule_type: {
        type: DataTypes.ENUM(...Object.values(SCHEDULE_TYPE)),
        allowNull: false,
        defaultValue: SCHEDULE_TYPE.DAILY,
      },
      schedule_details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      skip_dates: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      delivery_slot: {
        type: DataTypes.ENUM("morning", "evening"),
        allowNull: false,
        defaultValue: "morning",
      },
      paused_until: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Subscription",
      tableName: "subscriptions",
      timestamps: true,
      underscored: true,
    },
  );

  Subscription.STATUS = SUBSCRIPTION_STATUS;
  Subscription.SCHEDULE_TYPE = SCHEDULE_TYPE;

  return Subscription;
};
