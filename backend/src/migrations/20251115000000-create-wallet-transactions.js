"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("wallet_transactions", {
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
        comment: "Absolute amount of the transaction",
      },
      direction: {
        type: Sequelize.ENUM("credit", "debit"),
        allowNull: false,
        comment: "Explicit direction for UI and auditing: credit (+) or debit (-)",
      },
      type: {
        type: Sequelize.ENUM(
          "deposit",
          "purchase",
          "refund",
          "withdrawal",
          "adjustment",
        ),
        allowNull: false,
      },
      balance_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Running balance snapshot after this transaction",
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "ID of the related Order, Payment, or Subscription",
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "'order', 'payment', or 'subscription'",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Extra context: { sub_id, admin_id, reason, original_order_id }",
      },
      description: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addIndex("wallet_transactions", ["user_id"]);
    await queryInterface.addIndex("wallet_transactions", ["reference_id", "reference_type"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("wallet_transactions");
  },
};
