const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");

const isCustomer = (req, res, next) => {
  if (req.user.userType !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Customer only.",
    });
  }
  next();
};

router.use(authenticate, isCustomer);

const productController = require("../controllers/product.controller");
const categoryController = require("../controllers/category.controller");
const serviceableAreaController = require("../controllers/serviceable-area.controller");
const orderController = require("../controllers/order.controller");
const addressController = require("../controllers/address.controller");
const subscriptionController = require("../controllers/subscription.controller");

router.use(authenticate, isCustomer);

router.get("/profile", (req, res) => {
  res.json({ success: true, message: "Get customer profile" });
});

// Addresses
router.get("/addresses", addressController.getAddresses);
router.post("/addresses", addressController.addAddress);

// Subscriptions
router.get("/subscriptions", subscriptionController.getSubscriptions);
router.post("/subscriptions", subscriptionController.createSubscription);
router.post("/subscriptions/:id/pause", subscriptionController.pauseSubscription);
router.post("/subscriptions/:id/resume", subscriptionController.resumeSubscription);
router.post("/subscriptions/:id/cancel", subscriptionController.cancelSubscription);

// Products
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);
router.get("/products/:id/variants", productController.listVariants);

// Categories
router.get("/categories", categoryController.getAllCategories);

// Orders
router.post("/orders", orderController.createOrder);

// Serviceability
router.post(
  "/serviceability/check",
  serviceableAreaController.checkServiceability
);

module.exports = router;
