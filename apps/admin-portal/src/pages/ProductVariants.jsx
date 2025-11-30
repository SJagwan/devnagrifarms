import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import TextField from "../components/ui/TextField";
import Table from "../components/ui/Table";

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

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [variantForm, setVariantForm] = useState({
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
  });

  useEffect(() => {
    loadProduct();
    fetchVariants(lastQuery);
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getProduct(id);
      setProduct(data.data || null);
    } catch (e) {
      console.error("Failed to load product", e);
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
    setVariantForm({
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
    });
    setShowVariantModal(true);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
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
      images: variant.images?.map((img) => img.image_url) || [],
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
    } catch (e) {
      console.error("Failed to load variants", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVariant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...variantForm };

      if (editingVariant) {
        await adminAPI.updateProductVariant(id, editingVariant.id, payload);
      } else {
        await adminAPI.createProductVariant(id, payload);
      }

      setShowVariantModal(false);
      setEditingVariant(null);
      setOriginalFormData(null);
      setVariantForm({
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
      });
      loadProduct();
      fetchVariants(lastQuery);
    } catch (e) {
      console.error(
        editingVariant
          ? "Failed to update variant"
          : "Failed to create variant",
        e
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if form has changed (for edit mode)
  const hasFormChanged = () => {
    if (!editingVariant || !originalFormData) return true; // Allow submit for create mode

    return JSON.stringify(variantForm) !== JSON.stringify(originalFormData);
  };

  const columns = [
    {
      key: "sku",
      label: "SKU",
      sortKey: "sku",
      render: (row) => row.sku || "-",
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
        </div>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
  ];

  const filters = [
    {
      key: "is_active",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      key: "unit",
      label: "Unit",
      options: [
        { value: "pcs", label: "Pieces" },
        { value: "g", label: "Grams" },
        { value: "kg", label: "Kilograms" },
        { value: "ml", label: "Milliliters" },
        { value: "l", label: "Liters" },
      ],
    },
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
        right={
          <Button variant="secondary" onClick={handleOpenCreateVariant}>
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={variantForm.is_active}
                  onChange={(e) =>
                    handleVariantChange("is_active", e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              rows={3}
              value={variantForm.images.join("\n")}
              onChange={(e) =>
                handleVariantChange(
                  "images",
                  e.target.value.split("\n").filter((x) => x.trim())
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/img1.jpg\nhttps://example.com/img2.jpg"
            />
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
    </PageContainer>
  );
}
