"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("serviceable_areas", {
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
      coordinates: {
        type: Sequelize.GEOMETRY("POLYGON"),
        allowNull: false,
        comment: "Polygon representing the serviceable area",
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

    await queryInterface.addIndex("serviceable_areas", ["coordinates"], {
      type: "SPATIAL",
      name: "serviceable_areas_coordinates_spatial_idx",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("serviceable_areas");
  },
};
