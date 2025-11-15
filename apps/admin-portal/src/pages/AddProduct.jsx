import { useState, useEffect } from "react";
import { adminAPI } from "../lib/api/requests";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";

export default function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category_id: "",
    default_tax: "0",
  });
  const [variants, setVariants] = useState([
    {
      sku: "",
      type: "",
      source: "",
      quantity: "1",
      unit: "pcs",
      bottle_option: "",
      price: "",
      mrp: "",
      discount_percent: "",
      min_order_qty: "1",
      max_order_qty: "",
      is_active: true,
      images: [],
    },
  ]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await adminAPI.getCategories();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleProductChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: "",
        type: "",
        source: "",
        quantity: "1",
        unit: "pcs",
        bottle_option: "",
        price: "",
        mrp: "",
        discount_percent: "",
        min_order_qty: "1",
        max_order_qty: "",
        is_active: true,
        images: [],
      },
    ]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createProduct({ ...product, variants });
      alert("Product created successfully!");
      // Reset form
      setProduct({
        name: "",
        description: "",
        category_id: "",
        default_tax: "0",
      });
      setVariants([
        {
          sku: "",
          type: "",
          source: "",
          quantity: "1",
          unit: "pcs",
          bottle_option: "",
          price: "",
          mrp: "",
          discount_percent: "",
          min_order_qty: "1",
          max_order_qty: "",
          is_active: true,
          images: [],
        },
      ]);
    } catch (error) {
      alert(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Add New Product"
        subtitle="Create a product with variants and images"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {/* Product Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Product Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Product Name"
              value={product.name}
              onChange={(e) => handleProductChange("name", e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={product.category_id}
                onChange={(e) =>
                  handleProductChange("category_id", e.target.value)
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={product.description}
                onChange={(e) =>
                  handleProductChange("description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <TextField
              label="Tax % (GST)"
              type="number"
              step="0.01"
              value={product.default_tax}
              onChange={(e) =>
                handleProductChange("default_tax", e.target.value)
              }
            />
          </div>
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Product Variants
            </h2>
            <Button
              type="button"
              onClick={addVariant}
              size="sm"
              variant="secondary"
            >
              + Add Variant
            </Button>
          </div>

          {variants.map((variant, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  Variant {index + 1}
                </h3>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  label="SKU"
                  value={variant.sku}
                  onChange={(e) =>
                    handleVariantChange(index, "sku", e.target.value)
                  }
                  required
                />
                <TextField
                  label="Type"
                  value={variant.type}
                  onChange={(e) =>
                    handleVariantChange(index, "type", e.target.value)
                  }
                  placeholder="e.g., Fresh, Organic"
                />
                <TextField
                  label="Source"
                  value={variant.source}
                  onChange={(e) =>
                    handleVariantChange(index, "source", e.target.value)
                  }
                  placeholder="e.g., Farm name"
                />
                <TextField
                  label="Quantity"
                  type="number"
                  step="0.01"
                  value={variant.quantity}
                  onChange={(e) =>
                    handleVariantChange(index, "quantity", e.target.value)
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={variant.unit}
                    onChange={(e) =>
                      handleVariantChange(index, "unit", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="g">Grams</option>
                    <option value="kg">Kilograms</option>
                    <option value="ml">Milliliters</option>
                    <option value="l">Liters</option>
                  </select>
                </div>
                <TextField
                  label="Bottle Option"
                  value={variant.bottle_option}
                  onChange={(e) =>
                    handleVariantChange(index, "bottle_option", e.target.value)
                  }
                  placeholder="e.g., Glass, Plastic"
                />
                <TextField
                  label="Price (₹)"
                  type="number"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) =>
                    handleVariantChange(index, "price", e.target.value)
                  }
                  required
                />
                <TextField
                  label="MRP (₹)"
                  type="number"
                  step="0.01"
                  value={variant.mrp}
                  onChange={(e) =>
                    handleVariantChange(index, "mrp", e.target.value)
                  }
                  required
                />
                <TextField
                  label="Discount %"
                  type="number"
                  step="0.01"
                  value={variant.discount_percent}
                  onChange={(e) =>
                    handleVariantChange(
                      index,
                      "discount_percent",
                      e.target.value
                    )
                  }
                />
                <TextField
                  label="Min Order Qty"
                  type="number"
                  value={variant.min_order_qty}
                  onChange={(e) =>
                    handleVariantChange(index, "min_order_qty", e.target.value)
                  }
                  required
                />
                <TextField
                  label="Max Order Qty"
                  type="number"
                  value={variant.max_order_qty}
                  onChange={(e) =>
                    handleVariantChange(index, "max_order_qty", e.target.value)
                  }
                  required
                />
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={variant.is_active}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "is_active",
                          e.target.checked
                        )
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URLs (one per line)
                </label>
                <textarea
                  value={variant.images.join("\n")}
                  onChange={(e) =>
                    handleVariantChange(
                      index,
                      "images",
                      e.target.value.split("\n").filter((url) => url.trim())
                    )
                  }
                  rows={3}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>
            Create Product
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
