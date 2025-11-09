"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("refresh_tokens", {
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
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "Hashed refresh token (never store raw token)",
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: "IP address from which the token was issued",
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Device or browser information",
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "True if token has been manually invalidated",
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Expiration timestamp for the refresh token",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("refresh_tokens", ["user_id"]);
    await queryInterface.addIndex("refresh_tokens", ["token_hash"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("refresh_tokens");
  },
};
