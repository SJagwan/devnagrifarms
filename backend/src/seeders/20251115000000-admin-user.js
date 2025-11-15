"use strict";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'shubhanshu1997jagwan@gmail.com' LIMIT 1;`
    );

    if (existing.length > 0) {
      console.log("✓ Admin user already exists. Skipping seed.");
      return;
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash("Admin@123", 10);

    await queryInterface.bulkInsert("users", [
      {
        id: userId,
        first_name: "Shubhanshu",
        last_name: "Jagwan",
        email: "shubhanshu1997jagwan@gmail.com",
        phone: "8439830083",
        password_hash: passwordHash,
        user_type: "admin",
        status: "active",
        email_verified_at: new Date(),
        phone_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log("✅ Admin user created successfully");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: "shubhanshu1997jagwan@gmail.com",
    });
  },
};
