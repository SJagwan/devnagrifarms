const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const categoryController = require("../controllers/category.controller");
const productController = require("../controllers/product.controller");
const serviceableAreaController = require("../controllers/serviceable-area.controller");

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

router.get("/dashboard/stats", (req, res) => {
  res.json({ success: true, message: "Admin dashboard stats" });
});

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

module.exports = router;
