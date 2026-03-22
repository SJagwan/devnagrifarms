import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import { uploadVariantImages, getPublicImageUrl } from "../lib/storage";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import TextField from "../components/ui/TextField";
import Table from "../components/ui/Table";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { UNIT_OPTIONS, VARIANT_STATUS_OPTIONS } from "../lib/constants";

const INITIAL_VARIANT_FORM = {
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
};

export default function ProductVariants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [lastQuery, setLastQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "sku",
    sortDir: "ASC",
    filters: {},
  });
  const [totalItems, setTotalItems] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    variant: null,
  });
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [variantForm, setVariantForm] = useState(INITIAL_VARIANT_FORM);

  useEffect(() => {
    loadProduct();
    fetchVariants(lastQuery);
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getProduct(id);
      setProduct(data.data || null);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (field, value) => {
    setVariantForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenCreateVariant = () => {
    setEditingVariant(null);
    setOriginalFormData(null);
    setImageFiles([]);
    setVariantForm(INITIAL_VARIANT_FORM);
    setShowVariantModal(true);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    setImageFiles([]);
    const formData = {
      sku: variant.sku || "",
      type: variant.type || "",
      source: variant.source || "",
      quantity: String(variant.quantity || "1"),
      unit: variant.unit || "pcs",
      bottle_option: variant.bottle_option || "",
      price: String(variant.price || ""),
      mrp: String(variant.mrp || ""),
      discount_percent: String(variant.discount_percent || ""),
      min_order_qty: String(variant.min_order_qty || "1"),
      max_order_qty: String(variant.max_order_qty || ""),
      is_active: variant.is_active ?? true,
      images: variant.images?.map((img) => img.url) || [],
    };
    setVariantForm(formData);
    setOriginalFormData(formData);
    setShowVariantModal(true);
  };

  // Server-side fetch applying query params (pagination, search, filters, sort)
  const fetchVariants = async (query) => {
    setLoading(true);
    try {
      const params = {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        sortBy: query.sortBy || undefined,
        sortDir: query.sortDir || undefined,
        is_active: query.filters?.is_active || undefined,
        unit: query.filters?.unit || undefined,
      };
      const { data } = await adminAPI.getProductVariants(id, params);
      setVariants(data.data || []);
      if (data.meta) setTotalItems(data.meta.totalItems);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVariant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...variantForm };

      // Upload selected files (max 3) and merge with existing image entries
      let uploaded = [];
      if (imageFiles && imageFiles.length > 0) {
        uploaded = await uploadVariantImages(
          imageFiles,
          `products/variants/${id}`
        );
      }
      const existing = (variantForm.images || [])
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => s.length > 0)
        .map((s) => ({ key: s }));
      payload.images = [...uploaded, ...existing].slice(0, 3);

      if (editingVariant) {
        await adminAPI.updateProductVariant(id, editingVariant.id, payload);
      } else {
        await adminAPI.createProductVariant(id, payload);
      }

      setShowVariantModal(false);
      setEditingVariant(null);
      setOriginalFormData(null);
      setImageFiles([]);
      setVariantForm(INITIAL_VARIANT_FORM);
      loadProduct();
      fetchVariants(lastQuery);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  // Check if form has changed (for edit mode)
  const hasFormChanged = () => {
    if (!editingVariant || !originalFormData) return true; // Allow submit for create mode
    if (imageFiles && imageFiles.length > 0) return true;
    return JSON.stringify(variantForm) !== JSON.stringify(originalFormData);
  };

  const removeExistingImage = (indexToRemove) => {
    setVariantForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const removeNewFile = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const openDeleteConfirm = (variant) => {
    setDeleteConfirm({ isOpen: true, variant });
  };

  const handleDeleteVariant = async (variantId) => {
    setLoading(true);
    try {
      await adminAPI.deleteProductVariant(id, variantId);
      setDeleteConfirm({ isOpen: false, variant: null });
      fetchVariants(lastQuery);
    } catch {
      setDeleteConfirm({ isOpen: false, variant: null });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "sku",
      label: "SKU",
      sortKey: "sku",
      render: (row) => row.sku || "-",
    },
    {
      key: "images",
      label: "Images",
      render: (row) => (
        <div className="flex items-center gap-1">
          {Array.isArray(row.images) && row.images.length > 0 ? (
            row.images.slice(0, 3).map((img, idx) => {
              const src = img?.url || "";
              const publicUrl = getPublicImageUrl(src);
              const isUrl =
                typeof publicUrl === "string" && /^https?:\/\//.test(publicUrl);
              return isUrl ? (
                <img
                  key={idx}
                  src={publicUrl}
                  alt="variant"
                  className="w-8 h-8 rounded object-cover border"
                />
              ) : (
                <span
                  key={idx}
                  className="inline-block w-8 h-8 rounded bg-gray-100 text-gray-600 text-[10px] leading-8 text-center border"
                  title={src}
                >
                  key
                </span>
              );
            })
          ) : (
            <span className="text-xs text-gray-500">None</span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => row.type || "-",
    },
    {
      key: "quantity",
      label: "Qty",
      sortKey: "quantity",
      render: (row) => row.quantity,
      className: "whitespace-nowrap",
    },
    {
      key: "unit",
      label: "Unit",
      render: (row) => row.unit,
    },
    {
      key: "price",
      label: "Price",
      sortKey: "price",
      render: (row) => `₹${Number(row.price).toFixed(2)}`,
      className: "whitespace-nowrap",
    },
    {
      key: "mrp",
      label: "MRP",
      sortKey: "mrp",
      render: (row) => `₹${Number(row.mrp).toFixed(2)}`,
      className: "whitespace-nowrap",
    },
    {
      key: "is_active",
      label: "Active",
      sortKey: "is_active",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditVariant(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => openDeleteConfirm(row)}
          >
            Delete
          </Button>
        </div>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
  ];

  const filters = [
    { key: "is_active", label: "Status", options: VARIANT_STATUS_OPTIONS },
    { key: "unit", label: "Unit", options: UNIT_OPTIONS },
  ];

  const handleTableQueryChange = (query) => {
    setLastQuery(query);
    fetchVariants(query);
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Variants: ${product?.name || "Product"}`}
        subtitle="All variants under this product"
        onBack={() => navigate("/products")}
        right={
          <Button onClick={handleOpenCreateVariant}>
            + Add Variant
          </Button>
        }
      />

      <Table
        columns={columns}
        data={variants}
        totalItems={totalItems}
        loading={loading}
        enableSearch={true}
        searchPlaceholder="Search variants..."
        filters={filters}
        enableSorting={true}
        showPagination={true}
        onQueryChange={handleTableQueryChange}
        emptyMessage="No variants found."
        initialSort={{ sortBy: "sku", sortDir: "ASC" }}
      />

      <Modal
        isOpen={showVariantModal}
        onClose={() => {
          setShowVariantModal(false);
          setEditingVariant(null);
        }}
        title={editingVariant ? "Edit Variant" : "Add Variant"}
        size="lg"
      >
        <form onSubmit={handleSubmitVariant} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="SKU"
              value={variantForm.sku}
              onChange={(e) => handleVariantChange("sku", e.target.value)}
              required
            />
            <TextField
              label="Type"
              value={variantForm.type}
              onChange={(e) => handleVariantChange("type", e.target.value)}
            />
            <TextField
              label="Source"
              value={variantForm.source}
              onChange={(e) => handleVariantChange("source", e.target.value)}
            />
            <TextField
              label="Quantity"
              type="number"
              step="0.01"
              value={variantForm.quantity}
              onChange={(e) => handleVariantChange("quantity", e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={variantForm.unit}
                onChange={(e) => handleVariantChange("unit", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <TextField
              label="Bottle Option"
              value={variantForm.bottle_option}
              onChange={(e) =>
                handleVariantChange("bottle_option", e.target.value)
              }
            />
            <TextField
              label="Price (₹)"
              type="number"
              step="0.01"
              value={variantForm.price}
              onChange={(e) => handleVariantChange("price", e.target.value)}
              required
            />
            <TextField
              label="MRP (₹)"
              type="number"
              step="0.01"
              value={variantForm.mrp}
              onChange={(e) => handleVariantChange("mrp", e.target.value)}
              required
            />
            <TextField
              label="Discount %"
              type="number"
              step="0.01"
              value={variantForm.discount_percent}
              onChange={(e) =>
                handleVariantChange("discount_percent", e.target.value)
              }
            />
            <TextField
              label="Min Order Qty"
              type="number"
              value={variantForm.min_order_qty}
              onChange={(e) =>
                handleVariantChange("min_order_qty", e.target.value)
              }
              required
            />
            <TextField
              label="Max Order Qty"
              type="number"
              value={variantForm.max_order_qty}
              onChange={(e) =>
                handleVariantChange("max_order_qty", e.target.value)
              }
            />
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={variantForm.is_active}
                  onChange={(e) =>
                    handleVariantChange("is_active", e.target.checked)
                  }
                  className="mr-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images ({variantForm.images.length + imageFiles.length}/3)
            </label>

            {/* Existing images (edit mode) */}
            {variantForm.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {variantForm.images.map((url, idx) => {
                  const publicUrl = getPublicImageUrl(url);
                  const isUrl = typeof publicUrl === "string" && /^https?:\/\//.test(publicUrl);
                  return (
                    <div key={idx} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                      {isUrl ? (
                        <img src={publicUrl} alt={`Image ${idx + 1}`} className="w-full h-24 object-cover" />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center text-gray-400 text-xs">
                          No preview
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1 py-0.5 text-center">
                        Existing
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New file previews */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {imageFiles.map((f, idx) => (
                  <div key={idx} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    {f.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center text-gray-400 text-xs">
                        {f.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600/60 text-white text-[10px] px-1 py-0.5 text-center truncate">
                      New
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload input (only if total < 3) */}
            {(variantForm.images.length + imageFiles.length) < 3 && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const remaining = 3 - variantForm.images.length - imageFiles.length;
                  const newFiles = Array.from(e.target.files || []).slice(0, remaining);
                  setImageFiles((prev) => [...prev, ...newFiles].slice(0, 3 - variantForm.images.length));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
            )}

            <p className="text-xs text-gray-500 mt-1">
              {variantForm.images.length + imageFiles.length === 0
                ? "Select up to 3 image files to upload."
                : variantForm.images.length + imageFiles.length >= 3
                  ? "Maximum 3 images reached. Remove an image to add a new one."
                  : `You can add ${3 - variantForm.images.length - imageFiles.length} more image(s).`}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowVariantModal(false);
                setEditingVariant(null);
                setOriginalFormData(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={!hasFormChanged()}
            >
              {editingVariant ? "Update Variant" : "Create Variant"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, variant: null })}
        onConfirm={() => handleDeleteVariant(deleteConfirm.variant.id)}
        title="Delete Variant"
        message={`Are you sure you want to delete variant "${deleteConfirm.variant?.sku}"? This will also delete its images and inventory. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </PageContainer>
  );
}
