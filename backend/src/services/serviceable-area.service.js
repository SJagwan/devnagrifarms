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
  checkPointServiceability,
};

/**
 * Check if a point is inside any serviceable area
 * This requires a database with GIS support (PostGIS or MySQL 5.7+ with correct SRID)
 * For simplicity in this review/MVP, we'll iterate or use a simple bounding box check if Sequelize/DB setup allows, or just return true for now if complexity is high.
 *
 * Ideally: ST_Contains(polygon, point)
 */
const checkPointServiceability = async ({ lat, lng, pincode }) => {
  // TODO: Implement actual Polygon check using Sequelize.fn('ST_Within', ...) or similar
  // For the MVP demo, we will check if ANY serviceable area exists and just return that it is serviceable for demo purposes,
  // OR if we want to be stricter, we can implement the ray-casting algorithm in JS if the number of areas is small.

  // Let's implement a simple robust check:
  // 1. Get all active areas
  const areas = await serviceableAreaRepo.getAllActiveAreas();

  if (!areas || areas.length === 0) {
    return { serviceable: false, message: "No active service areas found." };
  }

  // If pincode matches name or some field? (optional)
  if (pincode) {
    const match = areas.find((a) => a.pincodes && a.pincodes.includes(pincode));
    if (match) return { serviceable: true, area: match };
  }

  // If lat/lng, do a PIP (Point in Polygon) check in JS for now (low scale)
  if (lat && lng) {
    const point = [Number(lat), Number(lng)];
    for (const area of areas) {
      if (area.coordinates && isPointInPolygon(point, area.coordinates)) {
        return { serviceable: true, area: area };
      }
      // Fail-safe: if no coordinates but area exists, maybe allow? No, strict.
    }
  }

  return { serviceable: false, message: "Location not served." };
};

// Ray-casting algorithm for Point in Polygon
// point: [lat, lng], vs: [[lat, lng], [lat, lng], ...] (Polygon vertices)
function isPointInPolygon(point, vs) {
  // Basic ray casting
  var x = point[0],
    y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
