const { ServiceableArea } = require("../models");
const { Op } = require("sequelize");

/**
 * Get all serviceable areas with pagination, search, and sorting
 */
const getServiceableAreasPaged = async ({
  page = 1,
  limit = 10,
  search,
  sortBy,
  sortDir = "ASC",
}) => {
  const where = {};

  // Search by name
  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }

  // Whitelist sortable columns
  const sortable = ["name", "created_at"];
  let order = [["name", "ASC"]];
  if (sortBy && sortable.includes(sortBy)) {
    order = [[sortBy, sortDir === "DESC" ? "DESC" : "ASC"]];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await ServiceableArea.findAndCountAll({
    where,
    limit,
    offset,
    order,
  });

  return { rows, count };
};

/**
 * Get single serviceable area by ID
 */
const getServiceableAreaById = async (id) => {
  return await ServiceableArea.findByPk(id);
};

/**
 * Create new serviceable area
 */
const createServiceableArea = async (data) => {
  return await ServiceableArea.create(data);
};

/**
 * Update existing serviceable area
 */
const updateServiceableArea = async (id, data) => {
  const area = await ServiceableArea.findByPk(id);
  if (!area) throw new Error("Serviceable area not found");
  return await area.update(data);
};

/**
 * Delete serviceable area
 */
const deleteServiceableArea = async (id) => {
  const area = await ServiceableArea.findByPk(id);
  if (!area) throw new Error("Serviceable area not found");
  await area.destroy();
  return true;
};

/**
 * Get all active serviceable areas (no pagination)
 */
const getAllActiveAreas = async () => {
  return await ServiceableArea.findAll({
    where: { is_active: true },
  });
};

module.exports = {
  getServiceableAreasPaged,
  getServiceableAreaById,
  createServiceableArea,
  updateServiceableArea,
  deleteServiceableArea,
  getAllActiveAreas,
};
