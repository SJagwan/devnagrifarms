"use strict";
const { Model } = require("sequelize");

const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
};

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Order.hasMany(models.OrderItem, { foreignKey: "order_id", as: "items" });
      Order.belongsTo(models.Subscription, {
        foreignKey: "subscription_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        as: "subscription",
      });
    }
  }

  Order.init(
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
      subscription_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
        defaultValue: ORDER_STATUS.PENDING,
      },
      payment_status: {
        type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
        defaultValue: PAYMENT_STATUS.UNPAID,
      },
      delivery_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
      underscored: true,
    }
  );

  Order.ORDER_STATUS = ORDER_STATUS;
  Order.PAYMENT_STATUS = PAYMENT_STATUS;

  return Order;
};
