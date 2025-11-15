const { Op } = require("sequelize");
const { Category } = require("../models");

const getAllCategories = async ({
  page,
  limit,
  search,
  sortBy,
  sortDir,
} = {}) => {
  const allowedSort = ["name", "description", "created_at", "updated_at"];
  const safeSortBy = allowedSort.includes(sortBy) ? sortBy : "name";
  const safeSortDir =
    sortDir && sortDir.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const result = await Category.findAndCountAll({
    where,
    order: [[safeSortBy, safeSortDir]],
    limit,
    offset,
  });

  return {
    rows: result.rows,
    count: result.count,
  };
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
