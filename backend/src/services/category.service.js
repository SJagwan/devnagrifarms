const categoryRepo = require("../repositories/category.repository");

const getAllCategories = async (options = {}) => {
  return await categoryRepo.getAllCategories(options);
};

const getCategoryById = async (id) => {
  return await categoryRepo.getCategoryById(id);
};

const createCategory = async (name, description, image_url) => {
  return await categoryRepo.createCategory({ name, description, image_url });
};

const updateCategory = async (id, name, description, image_url) => {
  return await categoryRepo.updateCategory(id, { name, description, image_url });
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
