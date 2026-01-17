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
      shipping_address_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "address_user",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        comment: "Where this subscription delivers to",
      },
      subscription_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "paused", "cancelled"),
        allowNull: false,
        defaultValue: "active",
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "Optional fixed end date",
      },
      schedule_type: {
        type: Sequelize.ENUM("d", "a", "w", "c"),
        allowNull: false,
        defaultValue: "d",
        comment: "d=daily, a=alternate, w=weekly, c=custom",
      },
      schedule_details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "For weekly: weekdays array. For custom: specific dates.",
      },
      skip_dates: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Array of dates to skip delivery (vacation mode)",
      },
      delivery_slot: {
        type: Sequelize.ENUM("morning", "evening"),
        allowNull: false,
        defaultValue: "morning",
        comment: "Preferred delivery time: morning (6-9 AM), evening (5-8 PM)",
      },
      paused_until: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "If paused, auto-resume on this date",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
    });

    await queryInterface.addIndex("subscriptions", ["user_id"], {
      name: "subscriptions_user_id_idx",
    });
    await queryInterface.addIndex(
      "subscriptions",
      ["status", "schedule_type"],
      {
        name: "subscriptions_status_schedule_type_idx",
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("subscriptions");
  },
};
