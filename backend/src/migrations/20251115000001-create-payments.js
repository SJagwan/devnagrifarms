"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("payments", {
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
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "INR",
      },
      gateway_id: {
        type: Sequelize.ENUM("razorpay", "phonepe"),
        allowNull: false,
        defaultValue: "razorpay",
      },
      gateway_order_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gateway_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "success", "failed", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      method: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "upi, card, netbanking, etc.",
      },
      raw_response: {
        type: Sequelize.JSON,
        allowNull: true,
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

    await queryInterface.addIndex("payments", ["user_id"]);
    await queryInterface.addIndex("payments", ["gateway_order_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("payments");
  },
};
