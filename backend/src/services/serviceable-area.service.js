const serviceableAreaRepo = require("../repositories/serviceable-area.repository");

/**
 * Get paginated list of serviceable areas
 */
const getAllServiceableAreas = async (query) => {
  const { page = 1, limit = 10, search, sortBy, sortDir = "ASC" } = query || {};

  const repoQuery = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search,
    sortBy,
    sortDir: sortDir === "DESC" ? "DESC" : "ASC",
  };

  const { rows, count } = await serviceableAreaRepo.getServiceableAreasPaged(
    repoQuery
  );

  const totalPages = Math.ceil(count / repoQuery.limit) || 1;
  return {
    items: rows,
    meta: {
      page: repoQuery.page,
      limit: repoQuery.limit,
      totalItems: count,
      totalPages,
    },
  };
};

/**
 * Get single serviceable area by ID
 */
const getServiceableAreaById = async (id) => {
  const area = await serviceableAreaRepo.getServiceableAreaById(id);
  if (!area) throw new Error("Serviceable area not found");
  return area;
};

/**
 * Create new serviceable area
 */
const createServiceableArea = async (data) => {
  // Validate required fields
  if (!data.name || !data.name.trim()) {
    throw new Error("Area name is required");
  }

  // For now, if coordinates aren't provided, create a simple default polygon
  // In production, you'd validate proper GeoJSON format
  if (!data.coordinates) {
    throw new Error("Coordinates are required");
  }

  return await serviceableAreaRepo.createServiceableArea(data);
};

/**
 * Update existing serviceable area
 */
const updateServiceableArea = async (id, data) => {
  // Validate if name is being updated
  if (data.name !== undefined && !data.name.trim()) {
    throw new Error("Area name cannot be empty");
  }

  return await serviceableAreaRepo.updateServiceableArea(id, data);
};

/**
 * Delete serviceable area
 */
const deleteServiceableArea = async (id) => {
  return await serviceableAreaRepo.deleteServiceableArea(id);
};

module.exports = {
  getAllServiceableAreas,
  getServiceableAreaById,
  createServiceableArea,
  updateServiceableArea,
  deleteServiceableArea,
};
