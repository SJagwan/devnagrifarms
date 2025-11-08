"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductVariantImage extends Model {
    static associate(models) {
      ProductVariantImage.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "variant",
      });
    }
  }

  ProductVariantImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "URL of the variant image",
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "ProductVariantImage",
      tableName: "product_variant_images",
      timestamps: true,
      underscored: true,
    }
  );

  return ProductVariantImage;
};
