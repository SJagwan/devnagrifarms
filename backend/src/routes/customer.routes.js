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

router.use(authenticate, isCustomer);

router.get("/profile", (req, res) => {
  res.json({ success: true, message: "Get customer profile" });
});

// Products
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);
router.get("/products/:id/variants", productController.listVariants);

// Categories
router.get("/categories", categoryController.getAllCategories);

// Serviceability
router.post(
  "/serviceability/check",
  serviceableAreaController.checkServiceability
);

module.exports = router;
