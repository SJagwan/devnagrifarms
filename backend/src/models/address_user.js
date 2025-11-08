"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AddressUser extends Model {
    static associate(models) {
      AddressUser.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
    }
  }

  AddressUser.init(
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
      address_type: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      address_line_1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address_line_2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "India",
      },
      zip_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "AddressUser",
      tableName: "address_user",
      timestamps: true,
      underscored: true,
    }
  );

  AddressUser.ADDRESS_TYPES = ADDRESS_TYPES;

  return AddressUser;
};
