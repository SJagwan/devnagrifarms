const bannerRepo = require("../repositories/banner.repository");
const AppError = require("../utils/AppError");
const storageService = require("./storage.service");

const getActiveBanners = async (position) => {
  return await bannerRepo.getActiveBanners(position);
};

const getAllBanners = async (query) => {
  const { page = 1, limit = 10, search, is_active, position } = query;
  const { rows, count } = await bannerRepo.getBannersPaged({
    page: Number(page),
    limit: Number(limit),
    search,
    is_active: is_active === "true" ? true : is_active === "false" ? false : undefined,
    position,
  });

  const totalPages = Math.ceil(count / limit) || 1;

  return {
    items: rows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: count,
      totalPages,
    },
  };
};

const getBannerById = async (id) => {
  const banner = await bannerRepo.getBannerById(id);
  if (!banner) throw new AppError("Banner not found", 404);
  return banner;
};

const createBanner = async (data) => {
  return await bannerRepo.createBanner(data);
};

const updateBanner = async (id, data) => {
  const existing = await bannerRepo.getBannerById(id);
  const success = await bannerRepo.updateBanner(id, data);
  if (!success) throw new AppError("Banner not found", 404);

  // Cleanup old image if it changed
  if (data.image_url && existing.image_url && data.image_url !== existing.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  } else if (data.image_url === "" && existing.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  }

  return await bannerRepo.getBannerById(id);
};

const deleteBanner = async (id) => {
  const existing = await bannerRepo.getBannerById(id);
  const success = await bannerRepo.deleteBanner(id);
  if (!success) throw new AppError("Banner not found", 404);

  if (existing?.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  }

  return true;
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
