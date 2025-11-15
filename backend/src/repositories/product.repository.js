const {
  Product,
  ProductVariant,
  ProductVariantImage,
  Category,
} = require("../models");
const { Op } = require("sequelize");

const getAllProducts = async () => {
  return await Product.findAll({
    include: [
      { model: Category, as: "category", attributes: ["id", "name"] },
      { model: ProductVariant, as: "variants", attributes: ["id"] },
    ],
    order: [["name", "ASC"]],
  });
};

const getProductsPaged = async ({
  page = 1,
  limit = 10,
  search,
  sortBy,
  sortDir = "ASC",
  category_id,
}) => {
  const where = {};
  if (category_id) where.category_id = category_id;
  if (search) {
    const like = { [Op.like]: `%${search}%` };
    where[Op.or] = [{ name: like }, { description: like }];
  }

  const sortable = ["name", "created_at"];
  let order = [["name", "ASC"]];
  if (sortBy && sortable.includes(sortBy)) {
    order = [[sortBy, sortDir === "DESC" ? "DESC" : "ASC"]];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: "category", attributes: ["id", "name"] },
      { model: ProductVariant, as: "variants", attributes: ["id"] },
    ],
    limit,
    offset,
    order,
  });
  return { rows, count };
};

const getProductById = async (id) => {
  return await Product.findByPk(id, {
    include: [{ model: Category, as: "category" }],
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
  getProductsPaged,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
