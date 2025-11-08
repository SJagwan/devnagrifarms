"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  ProductVariant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
      },
      unit: {
        type: DataTypes.ENUM("g", "kg", "ml", "l", "pcs"),
        allowNull: false,
        defaultValue: "pcs",
      },
      bottle_option: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      min_order_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      max_order_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "product_variants",
      timestamps: true,
      underscored: true,
    }
  );

  return ProductVariant;
};
