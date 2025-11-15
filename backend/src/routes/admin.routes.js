const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const categoryController = require("../controllers/category.controller");
const productController = require("../controllers/product.controller");

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

module.exports = router;
