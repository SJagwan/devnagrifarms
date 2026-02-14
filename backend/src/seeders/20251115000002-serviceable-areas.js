"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if any area exists
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM serviceable_areas LIMIT 1;`,
    );

    if (existing.length > 0) return;

    // Create a demo area (New Delhi / NCR approximate)
    // Polygon: [ [lat, lng], ... ] stored as JSON for MySQL (if generic JSON column) or specific GIS format.
    // Our model uses DataTypes.JSON for coordinates.
    // Coordinates: [[28.5, 77.1], [28.5, 77.3], [28.7, 77.3], [28.7, 77.1], [28.5, 77.1]]

    await queryInterface.bulkInsert("serviceable_areas", [
      {
        id: uuidv4(),
        name: "New Delhi Demo Zone",
        coordinates: Sequelize.fn(
          "ST_GeomFromText",
          "POLYGON((77.1 28.5, 77.3 28.5, 77.3 28.7, 77.1 28.7, 77.1 28.5))",
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("serviceable_areas", null, {});
  },
};
