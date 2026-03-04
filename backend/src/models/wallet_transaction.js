"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WalletTransaction extends Model {
    static associate(models) {
      WalletTransaction.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  WalletTransaction.init(
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
      direction: {
        type: DataTypes.ENUM("credit", "debit"),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          "deposit",
          "purchase",
          "refund",
          "withdrawal",
          "adjustment",
        ),
        allowNull: false,
      },
      balance_after: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WalletTransaction",
      tableName: "wallet_transactions",
      timestamps: true,
      underscored: true,
    },
  );

  return WalletTransaction;
};
