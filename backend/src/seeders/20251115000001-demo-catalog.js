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
        image_url: "https://images.unsplash.com/photo-1528750994593-924ee878e601?w=800",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Organic Farming",
        description: "Fresh organic vegetables & farm produce",
        image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Bakery",
        description: "Freshly baked artisan breads and cookies",
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
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
        is_one_time_allowed: false,
        image_url: "https://images.unsplash.com/photo-1563636619-e9107da5a1bb?w=800",
        default_tax: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        category_id: dairyId,
        name: "Pure Cow Ghee",
        description: "Traditional Bilona method Ghee.",
        is_subscribable: true,
        is_one_time_allowed: true,
        image_url: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800",
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
        is_one_time_allowed: false,
        image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800",
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
        image_url: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=800",
        default_tax: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        category_id: bakeryId,
        name: "Sourdough Bread",
        description: "Artisan sourdough bread, baked fresh daily.",
        is_subscribable: true,
        is_one_time_allowed: true,
        image_url: "https://images.unsplash.com/photo-1585478259715-876a6a60bfc0?w=800",
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

    // 4. Initialize Inventory for all variants
    const inventory = variants.map((v) => ({
      id: uuidv4(),
      product_variant_id: v.id,
      warehouse: "warehouse_1",
      quantity: 100,
      reserved_quantity: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }));


    await queryInterface.bulkInsert("inventory", inventory);

    // 4.5 Create Product Variant Images
    const variantImages = variants.map((v) => ({
      id: uuidv4(),
      product_variant_id: v.id,
      url: products.find((p) => p.id === v.product_id).image_url,
      is_primary: true,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("product_variant_images", variantImages);

    // 5. Create Banners
    const banners = [
      {
        id: uuidv4(),
        position: "HOME_CAROUSEL",
        audience: "ALL",
        title: "Fresh Harvest",
        subtitle: "Up to 30% OFF on Organic Vegetables",
        image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        cta_text: "Shop Now",
        link_type: "CATEGORY",
        link_id: farmId,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        position: "HOME_CAROUSEL",
        audience: "ALL",
        title: "Farm to Home",
        subtitle: "Free Delivery on orders above ₹499",
        image_url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80",
        cta_text: "Explore",
        link_type: "NONE",
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        position: "HOME_CAROUSEL",
        audience: "NON_SUBSCRIBERS",
        title: "Dairy Delights",
        subtitle: "Fresh A2 Milk & Artisanal Cheese",
        image_url: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80",
        cta_text: "Subscribe",
        link_type: "CATEGORY",
        link_id: dairyId,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        position: "HOME_STRIP",
        audience: "ALL",
        title: "Refer & Earn",
        subtitle: "Get ₹100 for every friend you refer",
        image_url: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80",
        cta_text: "Refer Now",
        link_type: "EXTERNAL",
        external_url: "https://devnagrifarms.com/refer",
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        position: "CART_PROMO",
        audience: "ALL",
        title: "Limited Time Offer",
        subtitle: "Add Organic Ghee to your cart and get 10% off",
        image_url: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80",
        cta_text: "Add Now",
        link_type: "PRODUCT",
        link_id: gheeId,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("banners", banners);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("banners", null, {});
    await queryInterface.bulkDelete("product_variant_images", null, {});
    await queryInterface.bulkDelete("inventory", null, {});
    await queryInterface.bulkDelete("product_variants", null, {});
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  },
};
