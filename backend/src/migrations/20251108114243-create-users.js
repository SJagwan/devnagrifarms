"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      is_phone_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      is_email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      userType: {
        type: Sequelize.ENUM("customer", "delivery", "admin"),
        defaultValue: "customer",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "blocked"),
        defaultValue: "active",
      },
      otp_code: {
        type: Sequelize.STRING(6),
        allowNull: true,
      },
      otp_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("users", ["email", "is_email_verified_at"], {
      unique: true,
      name: "users_verified_email_unique",
      where: {
        is_email_verified_at: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  },
};
