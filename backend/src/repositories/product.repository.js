const {
  Product,
  ProductVariant,
  ProductVariantImage,
  Category,
} = require("../models");

const getAllProducts = async () => {
  return await Product.findAll({
    include: [
      { model: Category, as: "category", attributes: ["id", "name"] },
      {
        model: ProductVariant,
        as: "variants",
        include: [{ model: ProductVariantImage, as: "images" }],
      },
    ],
    order: [["name", "ASC"]],
  });
};

const getProductById = async (id) => {
  return await Product.findByPk(id, {
    include: [
      { model: Category, as: "category" },
      {
        model: ProductVariant,
        as: "variants",
        include: [{ model: ProductVariantImage, as: "images" }],
      },
    ],
  });
};

const createProduct = async (data) => {
  return await Product.create(data);
};

const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("Product not found");
  return await product.update(data);
};

const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("Product not found");
  await product.destroy();
  return true;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
