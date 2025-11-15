const productRepo = require("../repositories/product.repository");
const variantRepo = require("../repositories/product-variant.repository");

const getAllProducts = async () => {
  return await productRepo.getAllProducts();
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

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
