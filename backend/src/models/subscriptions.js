"use strict";
const { Model } = require("sequelize");

const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
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
      Subscription.hasMany(models.SubscriptionItem, {
        foreignKey: "subscription_id",
        as: "items",
      });

      Subscription.hasOne(models.Order, {
        foreignKey: "subscription_id",
        as: "order",
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
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
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
        comment: "User-selected days/dates and optional quantity per day",
      },
      next_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Optional: calculated by the system for scheduler efficiency",
      },
      auto_renew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment:
          "If true, subscription will automatically renew after end_date",
      },
    },
    {
      sequelize,
      modelName: "Subscription",
      tableName: "subscriptions",
      timestamps: true,
      underscored: true,
    }
  );

  Subscription.STATUS = SUBSCRIPTION_STATUS;
  Subscription.SCHEDULE_TYPE = SCHEDULE_TYPE;

  return Subscription;
};
