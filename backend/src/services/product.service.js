const productRepo = require("../repositories/product.repository");
const variantRepo = require("../repositories/product-variant.repository");
const storageService = require("./storage.service");
const { ProductVariantImage, Inventory, OrderItem, SubscriptionItem, ProductVariant } = require("../models");

/**
 * Normalize image payload: accepts strings or objects with {key} or {url}.
 * Returns array of strings (keys), capped at maxImages.
 */
function normalizeImages(images, maxImages = 3) {
  if (!images || !Array.isArray(images)) return [];

  return images
    .filter((img) => img !== null && typeof img !== "undefined")
    .map((img) => {
      if (typeof img === "string") return img.trim();
      if (typeof img === "object" && img !== null) {
        const val = img.key || img.url || "";
        return typeof val === "string" ? val.trim() : "";
      }
      return "";
    })
    .filter((v) => v.length > 0)
    .slice(0, maxImages);
}

/**
 * Initialize inventory for a new variant
 */
async function initializeInventory(variantId) {
  await Inventory.create({
    product_variant_id: variantId,
    warehouse: "warehouse_1",
    quantity: 0,
    reserved_quantity: 0,
  });
}

/**
 * Replace variant images: deletes old DB records and S3 objects, adds new ones.
 * Returns array of keys that were deleted from S3.
 */
async function replaceVariantImages(variantId, newImages) {
  // Get existing images
  const existing = await variantRepo.getVariantById(variantId);
  const oldUrls = (existing?.images || [])
    .map((img) => img.url)
    .filter((u) => u);

  // Delete old DB records
  await ProductVariantImage.destroy({
    where: { product_variant_id: variantId },
  });

  // Normalize and add new images
  const normalized = normalizeImages(newImages, 3);
  for (let i = 0; i < normalized.length; i++) {
    await variantRepo.addVariantImage(variantId, normalized[i], i === 0);
  }

  // Delete old S3 objects (if not in new list)
  const toDelete = oldUrls.filter((u) => !normalized.includes(u));
  for (const url of toDelete) {
    try {
      await storageService.deleteObjectByUrl(url);
    } catch (err) {
      console.error(`Failed to delete S3 object ${url}:`, err.message);
    }
  }

  return toDelete;
}

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
      
      // Initialize zero stock for new variant
      await initializeInventory(createdVariant.id);

      // Normalize and cap images to max 3; support strings or objects with { key }
      if (images && Array.isArray(images)) {
        const normalized = normalizeImages(images, 3);
        for (let i = 0; i < normalized.length; i++) {
          await variantRepo.addVariantImage(
            createdVariant.id,
            normalized[i],
            i === 0
          );
        }
      }
    }
  }

  return await productRepo.getProductById(createdProduct.id);
};

const updateProduct = async (id, data) => {
  const existing = await productRepo.getProductById(id);
  const result = await productRepo.updateProduct(id, data);
  
  // Cleanup old image if it changed
  if (data.image_url && existing.image_url && data.image_url !== existing.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  } else if (data.image_url === "" && existing.image_url) {
    // Explicit removal
    await storageService.deleteObjectByUrl(existing.image_url);
  }
  
  return result;
};

const deleteProduct = async (id) => {
  const existing = await productRepo.getProductById(id);

  // Check if any variant of this product is referenced by orders or subscriptions
  const variantIds = await ProductVariant.findAll({
    where: { product_id: id },
    attributes: ["id"],
    raw: true,
  }).then((rows) => rows.map((r) => r.id));

  if (variantIds.length > 0) {
    const orderRef = await OrderItem.count({
      where: { product_variant_id: variantIds },
    });
    if (orderRef > 0) {
      const err = new Error(
        "Cannot delete product. It has variants linked to existing orders."
      );
      err.statusCode = 409;
      throw err;
    }

    const subRef = await SubscriptionItem.count({
      where: { product_variant_id: variantIds },
    });
    if (subRef > 0) {
      const err = new Error(
        "Cannot delete product. It has variants linked to existing subscriptions."
      );
      err.statusCode = 409;
      throw err;
    }
  }

  const result = await productRepo.deleteProduct(id);

  if (existing?.image_url) {
    await storageService.deleteObjectByUrl(existing.image_url);
  }

  return result;
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

  // Initialize zero stock for new variant
  await initializeInventory(createdVariant.id);

  // Normalize and cap images to max 3; support strings or objects with { key }
  if (images && Array.isArray(images)) {
    const normalized = normalizeImages(images, 3);
    for (let i = 0; i < normalized.length; i++) {
      await variantRepo.addVariantImage(
        createdVariant.id,
        normalized[i],
        i === 0
      );
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

  const { images, ...variantData } = data;
  const updated = await variantRepo.updateVariant(variantId, variantData);

  // If images provided, replace existing images
  if (images && Array.isArray(images)) {
    await replaceVariantImages(variantId, images);
  }

  return await variantRepo.getVariantById(variantId);
};

const deleteVariant = async (variantId) => {
  // Check if variant is referenced by orders or subscriptions
  const orderRef = await OrderItem.count({
    where: { product_variant_id: variantId },
  });
  if (orderRef > 0) {
    const err = new Error(
      "Cannot delete variant. It is linked to existing orders."
    );
    err.statusCode = 409;
    throw err;
  }

  const subRef = await SubscriptionItem.count({
    where: { product_variant_id: variantId },
  });
  if (subRef > 0) {
    const err = new Error(
      "Cannot delete variant. It is linked to existing subscriptions."
    );
    err.statusCode = 409;
    throw err;
  }

  // Get variant images before deletion
  const variant = await variantRepo.getVariantById(variantId);
  const imageUrls = (variant?.images || [])
    .map((img) => img.url)
    .filter((u) => u);

  // Delete variant (cascade deletes images from DB)
  await variantRepo.deleteVariant(variantId);

  // Delete S3 objects
  for (const url of imageUrls) {
    try {
      await storageService.deleteObjectByUrl(url);
    } catch (err) {
      console.error(`Failed to delete S3 object ${url}:`, err.message);
    }
  }

  return true;
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
