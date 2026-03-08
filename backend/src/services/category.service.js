const categoryRepo = require("../repositories/category.repository");
const storageService = require("./storage.service");

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
  const existing = await categoryRepo.getCategoryById(id);
  const result = await categoryRepo.updateCategory(id, { name, description, image_url });

  // Cleanup old image if it changed
  if (image_url && existing.image_url && image_url !== existing.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  } else if (image_url === "" && existing.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  }

  return result;
};

const deleteCategory = async (id) => {
  const existing = await categoryRepo.getCategoryById(id);
  const result = await categoryRepo.deleteCategory(id);

  if (existing?.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  }

  return result;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
