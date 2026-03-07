"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      // Banners use link_id to refer to either Product or Category
      // We use constraints: false because link_id is shared across different models
      Banner.belongsTo(models.Product, {
        foreignKey: "link_id",
        as: "product",
        constraints: false,
      });
      Banner.belongsTo(models.Category, {
        foreignKey: "link_id",
        as: "category",
        constraints: false,
      });
    }
  }

  Banner.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      position: {
        type: DataTypes.ENUM("HOME_CAROUSEL", "HOME_STRIP", "CART_PROMO", "SUB_OFFER", "PRODUCT_PAGE"),
        defaultValue: "HOME_CAROUSEL",
        allowNull: false,
      },
      audience: {
        type: DataTypes.ENUM("ALL", "NEW_USERS", "EXISTING_USERS", "NON_SUBSCRIBERS"),
        defaultValue: "ALL",
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      subtitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cta_text: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "Shop Now",
      },
      link_type: {
        type: DataTypes.ENUM("PRODUCT", "CATEGORY", "EXTERNAL", "NONE"),
        defaultValue: "NONE",
        allowNull: false,
      },
      link_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      external_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      start_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Banner",
      tableName: "banners",
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft deletes
      validate: {
        validDateRange() {
          if (this.start_at && this.end_at && this.start_at > this.end_at) {
            throw new Error("start_at cannot be after end_at");
          }
        },
      },
    }
  );

  return Banner;
};
