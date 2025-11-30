import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import TextField from "../components/ui/TextField";
import Table from "../components/ui/Table";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [queryState, setQueryState] = useState({ page: 1, limit: 10 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    default_tax: "0",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts(queryState);
  }, [queryState]);

  const fetchProducts = async (query) => {
    try {
      setLoading(true);
      const params = { page: query.page, limit: query.limit };
      const { data } = await adminAPI.getProducts(params);
      setProducts(data.data || []);
      if (data.meta) setTotalItems(data.meta.totalItems);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await adminAPI.getCategories();
      setCategories(data.data || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setOriginalFormData(null);
    setForm({ name: "", description: "", category_id: "", default_tax: "0" });
    setShowCreate(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const formData = {
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id || product.category?.id || "",
      default_tax: String(product.default_tax ?? "0"),
    };
    setForm(formData);
    setOriginalFormData(formData);
    setShowCreate(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, form);
      } else {
        await adminAPI.createProduct(form);
      }
      setForm({ name: "", description: "", category_id: "", default_tax: "0" });
      setShowCreate(false);
      setEditingProduct(null);
      setOriginalFormData(null);
      setQueryState((prev) => ({ ...prev, page: 1 }));
    } catch (e) {
      console.error(
        editingProduct
          ? "Failed to update product"
          : "Failed to create product",
        e
      );
    } finally {
      setLoading(false);
    }
  };

  const hasFormChanged = () => {
    if (!editingProduct || !originalFormData) return true;
    return JSON.stringify(form) !== JSON.stringify(originalFormData);
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row.name}</div>
          {row.description && (
            <div className="text-sm text-gray-500 line-clamp-1">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => row.category?.name || "-",
    },
    {
      key: "variantsCount",
      label: "Variants",
      render: (row) => row.variants?.length || 0,
      headerClassName: "text-left",
      className: "text-sm text-gray-700",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/products/${row.id}/variants`)}
          >
            View Variants
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            Edit
          </Button>
        </div>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
  ];

  const handleTableQueryChange = (query) => {
    setQueryState((prev) => ({
      ...prev,
      page: query.page,
      limit: query.limit,
    }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        subtitle="Manage products and their variants"
        right={
          <Button onClick={handleOpenCreate} variant="primary">
            + New Product
          </Button>
        }
      />
      <Table
        columns={columns}
        data={products}
        totalItems={totalItems}
        loading={loading}
        enableSorting={false}
        showPagination={true}
        onQueryChange={handleTableQueryChange}
        emptyMessage={'No products yet. Click "New Product" to create one.'}
      />

      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditingProduct(null);
          setOriginalFormData(null);
        }}
        title={editingProduct ? "Edit Product" : "Create Product"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={form.category_id}
              onChange={(e) => handleChange("category_id", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <TextField
            label="Tax % (GST)"
            type="number"
            step="0.01"
            value={form.default_tax}
            onChange={(e) => handleChange("default_tax", e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setEditingProduct(null);
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
              {editingProduct ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
