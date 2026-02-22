"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: "order_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "order",
      });
      OrderItem.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        as: "variant",
      });
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      product_variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      hsn_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tax_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cgst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      sgst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      igst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cgst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      sgst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      igst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "order_items",
      timestamps: true,
      underscored: true,
    },
  );

  return OrderItem;
};
