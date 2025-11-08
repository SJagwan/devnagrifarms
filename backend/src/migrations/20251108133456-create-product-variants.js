"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_variants", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
        comment: "Numeric quantity of product",
      },
      unit: {
        type: Sequelize.ENUM("g", "kg", "ml", "l", "pcs"),
        allowNull: false,
        defaultValue: "pcs",
        comment: "Unit of measurement",
      },
      bottle_option: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      mrp: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Maximum Retail Price",
      },
      discount_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: "Discount percentage applied to price",
      },
      min_order_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      max_order_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable("product_variants");
  },
};
