const { ProductVariant, ProductVariantImage, Product } = require("../models");
const { Op } = require("sequelize");

const getVariantsByProductId = async (productId) => {
  return await ProductVariant.findAll({
    where: { product_id: productId },
    include: [{ model: ProductVariantImage, as: "images" }],
  });
};

const getVariantsByProductIdPaged = async (
  productId,
  { page, limit, search, sortBy, sortDir = "ASC", is_active, unit }
) => {
  const where = { product_id: productId };
  if (typeof is_active !== "undefined") {
    where.is_active = is_active;
  }
  if (unit) {
    where.unit = unit;
  }
  if (search) {
    const like = { [Op.like]: `%${search}%` };
    where[Op.or] = [{ sku: like }, { type: like }, { unit: like }];
  }

  const sortable = ["sku", "price", "quantity", "mrp", "is_active"];
  let order = [["created_at", "DESC"]];
  if (sortBy && sortable.includes(sortBy)) {
    order = [[sortBy, sortDir === "DESC" ? "DESC" : "ASC"]];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await ProductVariant.findAndCountAll({
    where,
    include: [{ model: ProductVariantImage, as: "images" }],
    limit,
    offset,
    order,
  });

  return { rows, count };
};

const getVariantById = async (id) => {
  return await ProductVariant.findByPk(id, {
    include: [
      { model: ProductVariantImage, as: "images" },
      { model: Product, as: "product" },
    ],
  });
};

const createVariant = async (data) => {
  return await ProductVariant.create(data);
};

const updateVariant = async (id, data) => {
  const variant = await ProductVariant.findByPk(id);
  if (!variant) throw new Error("Variant not found");
  return await variant.update(data);
};

const deleteVariant = async (id) => {
  const variant = await ProductVariant.findByPk(id);
  if (!variant) throw new Error("Variant not found");
  await variant.destroy();
  return true;
};

const addVariantImage = async (variantId, imageUrl, isPrimary = false) => {
  return await ProductVariantImage.create({
    product_variant_id: variantId,
    url: imageUrl,
    is_primary: isPrimary,
  });
};

const deleteVariantImage = async (imageId) => {
  const image = await ProductVariantImage.findByPk(imageId);
  if (!image) throw new Error("Image not found");
  await image.destroy();
  return true;
};

module.exports = {
  getVariantsByProductId,
  getVariantsByProductIdPaged,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  addVariantImage,
  deleteVariantImage,
};
