"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      default_tax: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      is_subscribable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "If true, product can be subscribed",
      },
      is_one_time_allowed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "If true, product can be bought one-time",
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

    await queryInterface.addIndex("products", ["category_id"], {
      name: "products_category_id_idx",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("products");
  },
};
