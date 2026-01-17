"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  Payment.init(
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "INR",
      },
      gateway_id: {
        type: DataTypes.ENUM("razorpay", "phonepe"),
        allowNull: false,
        defaultValue: "razorpay",
      },
      gateway_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      gateway_payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      method: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      raw_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      timestamps: true,
      underscored: true,
    },
  );

  return Payment;
};
