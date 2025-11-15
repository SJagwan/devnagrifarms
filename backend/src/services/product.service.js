const productRepo = require("../repositories/product.repository");
const variantRepo = require("../repositories/product-variant.repository");

const getAllProducts = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy,
    sortDir = "ASC",
    category_id,
  } = query || {};

  const repoQuery = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search,
    sortBy,
    sortDir: sortDir === "DESC" ? "DESC" : "ASC",
    category_id,
  };

  const { rows, count } = await productRepo.getProductsPaged(repoQuery);
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

const getProductById = async (id) => {
  return await productRepo.getProductById(id);
};

const createProduct = async (productData) => {
  const { variants, ...product } = productData;

  const createdProduct = await productRepo.createProduct(product);

  if (variants && variants.length > 0) {
    for (const variant of variants) {
      const { images, ...variantData } = variant;
      variantData.product_id = createdProduct.id;

      const createdVariant = await variantRepo.createVariant(variantData);

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await variantRepo.addVariantImage(
            createdVariant.id,
            images[i],
            i === 0
          );
        }
      }
    }
  }

  return await productRepo.getProductById(createdProduct.id);
};

const updateProduct = async (id, data) => {
  return await productRepo.updateProduct(id, data);
};

const deleteProduct = async (id) => {
  return await productRepo.deleteProduct(id);
};

const listVariants = async (productId, query) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy,
    sortDir = "ASC",
    is_active,
    unit,
  } = query;

  const parsedIsActive =
    typeof is_active !== "undefined" ? is_active : undefined;
  const repoQuery = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search,
    sortBy,
    sortDir: sortDir === "DESC" ? "DESC" : "ASC",
    is_active:
      typeof parsedIsActive !== "undefined"
        ? parsedIsActive === "true" || parsedIsActive === true
        : undefined,
    unit,
  };

  const { rows, count } = await variantRepo.getVariantsByProductIdPaged(
    productId,
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

const addVariantToProduct = async (productId, data) => {
  const { images, ...variantData } = data;
  variantData.product_id = productId;
  const createdVariant = await variantRepo.createVariant(variantData);
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      await variantRepo.addVariantImage(createdVariant.id, images[i], i === 0);
    }
  }
  return await variantRepo.getVariantById(createdVariant.id);
};

const updateVariant = async (variantId, data) => {
  return await variantRepo.updateVariant(variantId, data);
};

const deleteVariant = async (variantId) => {
  return await variantRepo.deleteVariant(variantId);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listVariants,
  addVariantToProduct,
  updateVariant,
  deleteVariant,
};
