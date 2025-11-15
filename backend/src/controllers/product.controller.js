const productService = require("../services/product.service");

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    return res.json({
      success: true,
      data: products.items,
      meta: products.meta,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Variant controllers
const listVariants = async (req, res) => {
  try {
    const variants = await productService.listVariants(
      req.params.id,
      req.query
    );
    return res.json({
      success: true,
      data: variants.items,
      meta: variants.meta,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addVariant = async (req, res) => {
  try {
    const variant = await productService.addVariantToProduct(
      req.params.id,
      req.body
    );
    return res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: variant,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    const variant = await productService.updateVariant(
      req.params.variantId,
      req.body
    );
    return res.json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    await productService.deleteVariant(req.params.variantId);
    return res.json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listVariants,
  addVariant,
  updateVariant,
  deleteVariant,
};
