"use strict";
const { Model } = require("sequelize");

const WAREHOUSES = {
  WAREHOUSE_1: "warehouse_1",
  WAREHOUSE_2: "warehouse_2",
};

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id",
        as: "variant",
      });
    }
  }

  Inventory.init(
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
      warehouse: {
        type: DataTypes.ENUM(...Object.values(WAREHOUSES)),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reserved_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Inventory",
      tableName: "inventory",
      timestamps: true,
      underscored: true,
    }
  );

  Inventory.WAREHOUSES = WAREHOUSES;

  return Inventory;
};
