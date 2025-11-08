"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("subscriptions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      subscription_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "paused", "cancelled", "expired"),
        allowNull: false,
        defaultValue: "active",
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      schedule_type: {
        type: Sequelize.ENUM("d", "w", "a", "c"),
        allowNull: false,
        defaultValue: "d",
      },
      schedule_details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "User-selected days/dates and optional quantity per day",
      },
      next_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Optional: calculated by the system for scheduler efficiency",
      },
      auto_renew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment:
          "If true, subscription will automatically renew after end_date",
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("subscriptions");
  },
};
