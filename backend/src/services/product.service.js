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
  // Basic validation for variant payload
  const allowedUnits = ["pcs", "g", "kg", "ml", "l"];
  const errors = [];

  const reqString = (v) => typeof v === "string" && v.trim().length > 0;
  const toNum = (v) =>
    v === "" || v === null || typeof v === "undefined" ? NaN : Number(v);

  if (!reqString(data.sku)) errors.push("SKU is required");
  if (data.unit && !allowedUnits.includes(String(data.unit)))
    errors.push("Unit must be one of pcs, g, kg, ml, l");

  const priceNum = toNum(data.price);
  const mrpNum = toNum(data.mrp);
  const qtyNum = toNum(data.quantity);
  const minOrderNum = toNum(data.min_order_qty);
  const maxOrderNum = toNum(data.max_order_qty);
  const discountNum = toNum(data.discount_percent);

  if (isNaN(priceNum) || priceNum < 0)
    errors.push("Price must be a non-negative number");
  if (isNaN(mrpNum) || mrpNum < 0)
    errors.push("MRP must be a non-negative number");
  if (!isNaN(priceNum) && !isNaN(mrpNum) && priceNum > mrpNum)
    errors.push("Price cannot exceed MRP");
  if (isNaN(qtyNum) || qtyNum <= 0)
    errors.push("Quantity must be a positive number");
  if (!isNaN(minOrderNum) && minOrderNum <= 0)
    errors.push("Min order qty must be a positive number");
  if (!isNaN(maxOrderNum) && maxOrderNum < 0)
    errors.push("Max order qty must be a non-negative number");
  if (
    !isNaN(minOrderNum) &&
    !isNaN(maxOrderNum) &&
    maxOrderNum &&
    minOrderNum &&
    Number(maxOrderNum) < Number(minOrderNum)
  ) {
    errors.push("Max order qty cannot be less than min order qty");
  }
  if (!isNaN(discountNum) && (discountNum < 0 || discountNum > 100))
    errors.push("Discount percent must be between 0 and 100");

  if (errors.length) {
    const err = new Error(errors.join("; "));
    err.statusCode = 400;
    throw err;
  }

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
  // Same validations as create, but allow partial updates (only validate provided fields)
  const allowedUnits = ["pcs", "g", "kg", "ml", "l"];
  const errors = [];
  const toNum = (v) =>
    v === "" || v === null || typeof v === "undefined" ? NaN : Number(v);

  if (Object.prototype.hasOwnProperty.call(data, "sku")) {
    if (!(typeof data.sku === "string" && data.sku.trim().length > 0))
      errors.push("SKU is required");
  }
  if (Object.prototype.hasOwnProperty.call(data, "unit")) {
    if (data.unit && !allowedUnits.includes(String(data.unit)))
      errors.push("Unit must be one of pcs, g, kg, ml, l");
  }

  const priceNum = toNum(data.price);
  const mrpNum = toNum(data.mrp);
  const qtyNum = toNum(data.quantity);
  const minOrderNum = toNum(data.min_order_qty);
  const maxOrderNum = toNum(data.max_order_qty);
  const discountNum = toNum(data.discount_percent);

  if (Object.prototype.hasOwnProperty.call(data, "price")) {
    if (isNaN(priceNum) || priceNum < 0)
      errors.push("Price must be a non-negative number");
  }
  if (Object.prototype.hasOwnProperty.call(data, "mrp")) {
    if (isNaN(mrpNum) || mrpNum < 0)
      errors.push("MRP must be a non-negative number");
  }
  if (!isNaN(priceNum) && !isNaN(mrpNum) && priceNum > mrpNum)
    errors.push("Price cannot exceed MRP");
  if (Object.prototype.hasOwnProperty.call(data, "quantity")) {
    if (isNaN(qtyNum) || qtyNum <= 0)
      errors.push("Quantity must be a positive number");
  }
  if (Object.prototype.hasOwnProperty.call(data, "min_order_qty")) {
    if (!isNaN(minOrderNum) && minOrderNum <= 0)
      errors.push("Min order qty must be a positive number");
  }
  if (Object.prototype.hasOwnProperty.call(data, "max_order_qty")) {
    if (!isNaN(maxOrderNum) && maxOrderNum < 0)
      errors.push("Max order qty must be a non-negative number");
  }
  if (
    !isNaN(minOrderNum) &&
    !isNaN(maxOrderNum) &&
    maxOrderNum &&
    minOrderNum &&
    Number(maxOrderNum) < Number(minOrderNum)
  ) {
    errors.push("Max order qty cannot be less than min order qty");
  }
  if (Object.prototype.hasOwnProperty.call(data, "discount_percent")) {
    if (!isNaN(discountNum) && (discountNum < 0 || discountNum > 100))
      errors.push("Discount percent must be between 0 and 100");
  }

  if (errors.length) {
    const err = new Error(errors.join("; "));
    err.statusCode = 400;
    throw err;
  }

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
