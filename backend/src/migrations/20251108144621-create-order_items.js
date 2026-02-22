"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("order_items", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      product_variant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "product_variants",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      hsn_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      tax_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cgst_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      sgst_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      igst_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cgst_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      sgst_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      igst_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("order_items");
  },
};
