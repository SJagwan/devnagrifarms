"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: "category_id" });
      Product.hasMany(models.ProductVariant, { foreignKey: "product_id" });
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
        comment: "Product name",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Product description",
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Reference to product category",
      },
      default_tax: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: "Default tax percentage (GST) for India",
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
      underscored: true,
    }
  );

  return Product;
};
