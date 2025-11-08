"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AddressUser extends Model {
    static associate(models) {
      AddressUser.belongsTo(models.User, { foreignKey: "user_id" });
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
        type: DataTypes.STRING(255),
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
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    },
    {
      sequelize,
      modelName: "AddressUser",
      tableName: "address_user",
      timestamps: false,
      underscored: true,
    }
  );

  AddressUser.ADDRESS_TYPES = ADDRESS_TYPES;

  return AddressUser;
};
