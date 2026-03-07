const asyncHandler = require("../middlewares/asyncHandler");
const bannerService = require("../services/banner.service");

// Public
const getActiveBanners = asyncHandler(async (req, res) => {
  const { position = "HOME_CAROUSEL" } = req.query;
  const banners = await bannerService.getActiveBanners(position);
  res.json({
    success: true,
    data: banners,
  });
});

// Admin
const getAllBanners = asyncHandler(async (req, res) => {
  const result = await bannerService.getAllBanners(req.query);
  res.json({
    success: true,
    data: result,
  });
});

const getBannerById = asyncHandler(async (req, res) => {
  const banner = await bannerService.getBannerById(req.params.id);
  res.json({
    success: true,
    data: banner,
  });
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.createBanner(req.body);
  res.status(201).json({
    success: true,
    data: banner,
    message: "Banner created successfully",
  });
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.updateBanner(req.params.id, req.body);
  res.json({
    success: true,
    data: banner,
    message: "Banner updated successfully",
  });
});

const deleteBanner = asyncHandler(async (req, res) => {
  await bannerService.deleteBanner(req.params.id);
  res.json({
    success: true,
    message: "Banner deleted successfully",
  });
});

module.exports = {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
