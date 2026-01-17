"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, {
        foreignKey: "category_id",
        as: "products",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Category.init(
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
        unique: true,
        comment: "Name of the product category",
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Optional description of the category",
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
      underscored: true,
    },
  );

  return Category;
};
