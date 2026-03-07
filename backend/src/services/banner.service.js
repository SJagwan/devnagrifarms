const bannerRepo = require("../repositories/banner.repository");
const AppError = require("../utils/AppError");

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
  const success = await bannerRepo.updateBanner(id, data);
  if (!success) throw new AppError("Banner not found", 404);
  return await bannerRepo.getBannerById(id);
};

const deleteBanner = async (id) => {
  const success = await bannerRepo.deleteBanner(id);
  if (!success) throw new AppError("Banner not found", 404);
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
