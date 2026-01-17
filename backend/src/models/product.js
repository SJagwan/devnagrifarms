"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "category_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "category",
      });
      Product.hasMany(models.ProductVariant, {
        foreignKey: "product_id",
        as: "variants",
      });
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      default_tax: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      is_subscribable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_one_time_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
      underscored: true,
    },
  );

  return Product;
};
