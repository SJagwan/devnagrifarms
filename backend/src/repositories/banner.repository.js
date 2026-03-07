const { Banner, Product, Category, Sequelize } = require("../models");
const { Op } = Sequelize;

const getActiveBanners = async (position = "HOME_CAROUSEL") => {
  const now = new Date();
  const where = {
    is_active: true,
    position,
    [Op.and]: [
      {
        [Op.or]: [{ start_at: null }, { start_at: { [Op.lte]: now } }],
      },
      {
        [Op.or]: [{ end_at: null }, { end_at: { [Op.gte]: now } }],
      },
    ],
  };

  return await Banner.findAll({
    where,
    order: [["display_order", "ASC"], ["created_at", "DESC"]],
  });
};

const getBannersPaged = async ({
  page = 1,
  limit = 10,
  search,
  is_active,
  position,
}) => {
  const where = {};
  if (typeof is_active !== "undefined") where.is_active = is_active;
  if (position) where.position = position;
  
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { subtitle: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await Banner.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "image_url"] },
      { model: Category, as: "category", attributes: ["id", "name"] },
    ],
    order: [["display_order", "ASC"], ["created_at", "DESC"]],
  });

  return { rows, count };
};

const getBannerById = async (id) => {
  return await Banner.findByPk(id, {
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "image_url"] },
      { model: Category, as: "category", attributes: ["id", "name"] },
    ],
  });
};

const createBanner = async (data) => {
  return await Banner.create(data);
};

const updateBanner = async (id, data) => {
  const banner = await Banner.findByPk(id);
  if (!banner) return false;
  await banner.update(data);
  return true;
};

const deleteBanner = async (id) => {
  const banner = await Banner.findByPk(id);
  if (!banner) return false;
  await banner.destroy(); // Soft delete because of paranoid: true
  return true;
};

module.exports = {
  getActiveBanners,
  getBannersPaged,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
