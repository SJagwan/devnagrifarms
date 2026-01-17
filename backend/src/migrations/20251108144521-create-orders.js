"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("orders", {
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
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "subscriptions",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        comment: "If from subscription, links to parent subscription",
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
        comment: "Reference to address book entry",
      },
      shipping_address_snapshot: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "Frozen copy of address at order time (immutable)",
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "confirmed",
          "preparing",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ),
        defaultValue: "pending",
      },
      payment_status: {
        type: Sequelize.ENUM("unpaid", "paid", "refunded"),
        defaultValue: "unpaid",
      },
      delivery_slot: {
        type: Sequelize.ENUM("morning", "evening"),
        allowNull: false,
        defaultValue: "morning",
        comment: "Actual delivery slot: morning (6-8 AM), evening (5-7 PM)",
      },
      delivery_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Customer delivery notes",
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

    await queryInterface.addIndex("orders", ["delivery_date"], {
      name: "orders_delivery_date_idx",
    });
    await queryInterface.addIndex("orders", ["user_id", "created_at"], {
      name: "orders_user_id_created_at_idx",
    });
    await queryInterface.addIndex("orders", ["status"], {
      name: "orders_status_idx",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("orders");
  },
};
