const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");
const userValidation = require("../validations/user.validation");
const orderValidation = require("../validations/order.validation");
const subscriptionValidation = require("../validations/subscription.validation");
const categoryController = require("../controllers/category.controller");
const productController = require("../controllers/product.controller");
const serviceableAreaController = require("../controllers/serviceable-area.controller");
const storageController = require("../controllers/storage.controller");
const orderController = require("../controllers/order.controller");
const subscriptionController = require("../controllers/subscription.controller");
const userController = require("../controllers/user.controller");
const walletController = require("../controllers/wallet.controller");
const bannerController = require("../controllers/banner.controller");
const dashboardController = require("../controllers/dashboard.controller");
const invoiceController = require("../controllers/invoice.controller");
const bannerValidation = require("../validations/banner.validation");

const isAdmin = (req, res, next) => {
  if (req.user.userType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/dashboard/stats", dashboardController.getStats);

// User management
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.patch("/users/:id/status", validate(userValidation.updateStatus), userController.updateStatus);
router.put("/users/:id/profile", userController.updateProfile);

// Wallet management
router.get("/wallet/transactions", walletController.adminGetAllTransactions);
router.get("/users/:userId/wallet/passbook", walletController.adminGetUserPassbook);
router.post("/users/:userId/wallet/adjustment", walletController.adminManualAdjustment);

// Order management
router.get("/orders", orderController.getOrders);
router.get("/orders/:id", orderController.getOrderById);
router.patch("/orders/:id/status", validate(orderValidation.updateStatus), orderController.updateStatus);
router.get("/orders/:id/invoice", invoiceController.getInvoice);

// Subscription management
router.get("/subscriptions", subscriptionController.adminGetSubscriptions);
router.get("/subscriptions/:id", subscriptionController.adminGetSubscriptionById);
router.patch("/subscriptions/:id/status", validate(subscriptionValidation.adminUpdateStatus), subscriptionController.adminUpdateStatus);

// Category management
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// Product management
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

// Product variants
router.get("/products/:id/variants", productController.listVariants);
router.post("/products/:id/variants", productController.addVariant);
router.put(
  "/products/:id/variants/:variantId",
  productController.updateVariant
);
router.delete(
  "/products/:id/variants/:variantId",
  productController.deleteVariant
);

// Serviceable areas management
router.get(
  "/serviceable-areas",
  serviceableAreaController.getAllServiceableAreas
);
router.get(
  "/serviceable-areas/:id",
  serviceableAreaController.getServiceableAreaById
);
router.post(
  "/serviceable-areas",
  serviceableAreaController.createServiceableArea
);
router.put(
  "/serviceable-areas/:id",
  serviceableAreaController.updateServiceableArea
);
router.delete(
  "/serviceable-areas/:id",
  serviceableAreaController.deleteServiceableArea
);

// Banners management
router.get("/banners", bannerController.getAllBanners);
router.get("/banners/:id", bannerController.getBannerById);
router.post(
  "/banners",
  validate(bannerValidation.createBanner),
  bannerController.createBanner
);
router.put(
  "/banners/:id",
  validate(bannerValidation.updateBanner),
  bannerController.updateBanner
);
router.delete("/banners/:id", bannerController.deleteBanner);

// Storage (S3) - pre-signed URL generation
router.post("/storage/presign", storageController.getPresignedUploadUrl);
router.delete("/storage/delete", storageController.deleteObject);

module.exports = router;
