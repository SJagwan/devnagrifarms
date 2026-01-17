"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create Categories
    const categories = [
      {
        id: uuidv4(),
        name: "Dairy",
        description: "Fresh farm milk and by-products",
        image_url: "https://via.placeholder.com/150",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Organic Farming",
        description: "Fresh organic vegetables & farm produce",
        image_url: "https://via.placeholder.com/150",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Bakery",
        description: "Freshly baked artisan breads and cookies",
        image_url: "https://via.placeholder.com/150",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("categories", categories);

    // 2. Create Products
    const dairyId = categories[0].id;
    const farmId = categories[1].id;
    const bakeryId = categories[2].id;

    const products = [
      {
        id: uuidv4(),
        category_id: dairyId,
        name: "Buffalo Milk",
        description: "Pure, fresh A2 Buffalo Milk delivered daily.",
        is_subscribable: true,
        is_one_time_allowed: false, // Subscription only
        default_tax: 0, // No tax on raw milk
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        category_id: dairyId,
        name: "Pure Cow Ghee",
        description: "Traditional Bilona method Ghee.",
        is_subscribable: true,
        is_one_time_allowed: true, // Both allowed
        default_tax: 12,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        category_id: dairyId,
        name: "Malai Paneer",
        description: "Soft and fresh paneer made from buffalo milk.",
        is_subscribable: true,
        is_one_time_allowed: false, // Subscription only for perishables often
        default_tax: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        category_id: farmId,
        name: "Farm Potato",
        description: "Organic potatoes locally grown.",
        is_subscribable: true,
        is_one_time_allowed: true,
        default_tax: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        category_id: bakeryId,
        name: "Sourdough Bread",
        description: "Artisan sourdough bread, baked fresh daily.",
        is_subscribable: true, // Daily bread subscription!
        is_one_time_allowed: true,
        default_tax: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("products", products);

    // 3. Create Product Variants
    const milkId = products[0].id;
    const gheeId = products[1].id;
    const paneerId = products[2].id;
    const potatoId = products[3].id;
    const breadId = products[4].id;

    const variants = [
      // Milk Variants
      {
        id: uuidv4(),
        product_id: milkId,
        sku: "BM-500",
        quantity: 500,
        unit: "ml",
        price: 35,
        mrp: 35,
        min_order_qty: 1,
        max_order_qty: 10,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        product_id: milkId,
        sku: "BM-1000",
        quantity: 1,
        unit: "l",
        price: 68,
        mrp: 70,
        min_order_qty: 1,
        max_order_qty: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Ghee Variants
      {
        id: uuidv4(),
        product_id: gheeId,
        sku: "GHEE-500",
        quantity: 500,
        unit: "ml",
        price: 600,
        mrp: 650,
        min_order_qty: 1,
        max_order_qty: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Paneer
      {
        id: uuidv4(),
        product_id: paneerId,
        sku: "PAN-200",
        quantity: 200,
        unit: "g",
        price: 90,
        mrp: 100,
        min_order_qty: 1,
        max_order_qty: 10,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Potato
      {
        id: uuidv4(),
        product_id: potatoId,
        sku: "POT-1KG",
        quantity: 1,
        unit: "kg",
        price: 40,
        mrp: 50,
        min_order_qty: 1,
        max_order_qty: 20,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Bread
      {
        id: uuidv4(),
        product_id: breadId,
        sku: "BRD-SOUR",
        quantity: 400,
        unit: "g",
        price: 120,
        mrp: 150,
        min_order_qty: 1,
        max_order_qty: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("product_variants", variants);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("product_variants", null, {});
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  },
};
