const { Category } = require("../models");

const getAllCategories = async () => {
  return await Category.findAll({
    order: [["name", "ASC"]],
  });
};

const getCategoryById = async (id) => {
  return await Category.findByPk(id);
};

const createCategory = async (data) => {
  return await Category.create(data);
};

const updateCategory = async (id, data) => {
  const category = await Category.findByPk(id);
  if (!category) throw new Error("Category not found");
  return await category.update(data);
};

const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new Error("Category not found");
  await category.destroy();
  return true;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
