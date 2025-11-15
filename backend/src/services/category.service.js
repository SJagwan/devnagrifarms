const categoryRepo = require("../repositories/category.repository");

const getAllCategories = async () => {
  return await categoryRepo.getAllCategories();
};

const getCategoryById = async (id) => {
  return await categoryRepo.getCategoryById(id);
};

const createCategory = async (name, description) => {
  return await categoryRepo.createCategory({ name, description });
};

const updateCategory = async (id, name, description) => {
  return await categoryRepo.updateCategory(id, { name, description });
};

const deleteCategory = async (id) => {
  return await categoryRepo.deleteCategory(id);
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
