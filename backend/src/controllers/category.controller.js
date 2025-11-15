const categoryService = require("../services/category.service");

const getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q = "",
      sortBy = "name",
      sortDir = "ASC",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const { rows, count } = await categoryService.getAllCategories({
      page: pageNum,
      limit: limitNum,
      search: q,
      sortBy,
      sortDir,
    });

    const totalPages = Math.ceil(count / limitNum) || 1;

    return res.json({
      success: true,
      data: rows,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }
    const category = await categoryService.createCategory(name, description);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    if (
      error?.name === "SequelizeUniqueConstraintError" ||
      error?.original?.code === "ER_DUP_ENTRY"
    ) {
      return res
        .status(409)
        .json({ success: false, message: "Category name already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await categoryService.updateCategory(
      req.params.id,
      name,
      description
    );
    return res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
