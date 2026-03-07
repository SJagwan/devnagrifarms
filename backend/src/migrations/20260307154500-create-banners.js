"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("banners", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      position: {
        type: Sequelize.ENUM("HOME_CAROUSEL", "HOME_STRIP", "CART_PROMO", "SUB_OFFER", "PRODUCT_PAGE"),
        defaultValue: "HOME_CAROUSEL",
        allowNull: false,
      },
      audience: {
        type: Sequelize.ENUM("ALL", "NEW_USERS", "EXISTING_USERS", "NON_SUBSCRIBERS"),
        defaultValue: "ALL",
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      subtitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      cta_text: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "Shop Now",
      },
      link_type: {
        type: Sequelize.ENUM("PRODUCT", "CATEGORY", "EXTERNAL", "NONE"),
        defaultValue: "NONE",
        allowNull: false,
      },
      link_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      external_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      start_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Indexes for production performance
    await queryInterface.addIndex("banners", ["position", "is_active"]);
    await queryInterface.addIndex("banners", ["start_at", "end_at"]);
    await queryInterface.addIndex("banners", ["display_order"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("banners");
  },
};
