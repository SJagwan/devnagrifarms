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

  const { rows, count } =
    await serviceableAreaRepo.getServiceableAreasPaged(repoQuery);

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

/**
 * Check if a point is inside any serviceable area
 * This requires a database with GIS support (PostGIS or MySQL 5.7+ with correct SRID)
 * For simplicity in this review/MVP, we'll iterate or use a simple bounding box check if Sequelize/DB setup allows, or just return true for now if complexity is high.
 *
 * Ideally: ST_Contains(polygon, point)
 */
const checkPointServiceability = async ({ lat, lng, pincode }) => {
  // TODO: Implement actual Polygon check using Sequelize.fn('ST_Within', ...) or similar
  // For the MVP demo, we will check if ANY serviceable area exists.

  // 1. Get all active areas
  const areas = await serviceableAreaRepo.getAllActiveAreas();

  // DEV MODE FALLBACK: If no areas defined, assume serviceable everywhere for testing
  // SAFETY: Only allow this in development environment
  if (
    (!areas || areas.length === 0) &&
    process.env.NODE_ENV === "development"
  ) {
    console.warn(
      "⚠️ No serviceable areas defined. Allowing location (DEV MODE).",
    );
    return { serviceable: true, message: "Serviceable (Dev Mode)" };
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
      let polygon = [];
      // Handle Sequelize GeoJSON format (nested coordinates)
      // MySQL Polygon: { type: 'Polygon', coordinates: [ [ [x, y], ... ] ] }
      if (
        area.coordinates &&
        area.coordinates.coordinates &&
        area.coordinates.coordinates.length > 0
      ) {
        polygon = area.coordinates.coordinates[0];
      } else if (Array.isArray(area.coordinates)) {
        // Fallback for raw JSON array if used
        polygon = area.coordinates;
      }

      // GeoJSON is [lng, lat], but our ray-casting expects [lat, lng] or we swap?
      // ST_GeomFromText('POLYGON((lng lat, ...))') -> MySQL stores as X(lng) Y(lat).
      // Sequelize/MySQL generic geometry usually returns coordinates as [x, y] => [lng, lat].
      // My isPointInPolygon uses point[0] as x(lat?) and point[1] as y(lng?).
      // Wait, isPointInPolygon vars are: x = point[0], y = point[1].
      // If point passed is [lat, lng], then x=lat, y=lng.
      // GeoJSON coordinates are [lng, lat].
      // So we need to ensure we compare correctly.
      // Let's swap the polygon coordinates to [lat, lng] for the check.

      const polygonLatLng = polygon.map((p) => [p[1], p[0]]);

      if (isPointInPolygon(point, polygonLatLng)) {
        return { serviceable: true, area: area };
      }
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

module.exports = {
  getAllServiceableAreas,
  getServiceableAreaById,
  createServiceableArea,
  updateServiceableArea,
  deleteServiceableArea,
  checkPointServiceability,
};
