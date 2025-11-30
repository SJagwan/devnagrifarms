const serviceableAreaService = require("../services/serviceable-area.service");

/**
 * Get all serviceable areas with pagination
 */
const getAllServiceableAreas = async (req, res) => {
  try {
    const areas = await serviceableAreaService.getAllServiceableAreas(
      req.query
    );
    return res.json({
      success: true,
      data: areas.items,
      meta: areas.meta,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single serviceable area by ID
 */
const getServiceableAreaById = async (req, res) => {
  try {
    const area = await serviceableAreaService.getServiceableAreaById(
      req.params.id
    );
    return res.json({ success: true, data: area });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * Create new serviceable area
 */
const createServiceableArea = async (req, res) => {
  try {
    const area = await serviceableAreaService.createServiceableArea(req.body);
    return res.status(201).json({
      success: true,
      message: "Serviceable area created successfully",
      data: area,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update serviceable area
 */
const updateServiceableArea = async (req, res) => {
  try {
    const area = await serviceableAreaService.updateServiceableArea(
      req.params.id,
      req.body
    );
    return res.json({
      success: true,
      message: "Serviceable area updated successfully",
      data: area,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * Delete serviceable area
 */
const deleteServiceableArea = async (req, res) => {
  try {
    await serviceableAreaService.deleteServiceableArea(req.params.id);
    return res.json({
      success: true,
      message: "Serviceable area deleted successfully",
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllServiceableAreas,
  getServiceableAreaById,
  createServiceableArea,
  updateServiceableArea,
  deleteServiceableArea,
};
