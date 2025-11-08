"use strict";
const { Model } = require("sequelize");

const USER_TYPES = {
  CUSTOMER: "customer",
  DELIVERY: "delivery",
  ADMIN: "admin",
};

const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
};

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.AddressUser, {
        foreignKey: "user_id",
        as: "addresses",
        onDelete: "CASCADE",
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      userType: {
        type: DataTypes.ENUM(...Object.values(USER_TYPES)),
        defaultValue: USER_TYPES.CUSTOMER,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(USER_STATUS)),
        defaultValue: USER_STATUS.ACTIVE,
      },
      is_email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_phone_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  User.USER_TYPES = USER_TYPES;
  User.USER_STATUS = USER_STATUS;

  return User;
};
