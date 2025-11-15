const { ProductVariant, ProductVariantImage } = require("../models");

const getVariantsByProductId = async (productId) => {
  return await ProductVariant.findAll({
    where: { product_id: productId },
    include: [{ model: ProductVariantImage, as: "images" }],
  });
};

const getVariantById = async (id) => {
  return await ProductVariant.findByPk(id, {
    include: [{ model: ProductVariantImage, as: "images" }],
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
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  addVariantImage,
  deleteVariantImage,
};
