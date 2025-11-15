import { useState, useEffect } from "react";
import { adminAPI } from "../lib/api/requests";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [lastQuery, setLastQuery] = useState({
    page: 1,
    limit: 10,
    q: "",
    sortBy: "name",
    sortDir: "ASC",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    category: null,
  });

  const loadCategories = async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getCategories(params);
      setCategories(data.data || []);
      const meta = data.meta || { total: (data.data || []).length };
      setTotal(meta.total || 0);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await adminAPI.updateCategory(editingId, formData);
      } else {
        await adminAPI.createCategory(formData);
      }
      setFormData({ name: "", description: "" });
      setShowForm(false);
      setEditingId(null);
      loadCategories(lastQuery);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await adminAPI.deleteCategory(id);
      setDeleteConfirm({ isOpen: false, category: null });
      loadCategories(lastQuery);
    } catch (error) {
      alert(error.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (category) => {
    setDeleteConfirm({ isOpen: true, category });
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleTableQueryChange = (query) => {
    const { page, limit, search, sortBy, sortDir } = query;
    const params = {
      page,
      limit,
      q: search || "",
      sortBy: sortBy || "name",
      sortDir: sortDir || "ASC",
    };
    setLastQuery(params);
    loadCategories(params);
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      sortKey: "name",
      render: (row) => (
        <div className="text-sm font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      sortKey: "description",
      render: (row) => (
        <div className="text-sm text-gray-500">{row.description || "-"}</div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right text-sm font-medium",
      render: (row) => (
        <div className="flex gap-4 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-primary-600 hover:text-primary-900"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteConfirm(row)}
            className="text-red-600 hover:text-red-900 hover:bg-red-50 focus-visible:ring-red-600"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        right={
          <Button onClick={() => setShowForm(true)}>+ Add Category</Button>
        }
      />

      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingId ? "Edit Category" : "Add New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <Table
        columns={columns}
        data={categories}
        onQueryChange={handleTableQueryChange}
        totalItems={total}
        loading={loading}
        enableSorting
        emptyMessage="No categories yet. Click 'Add Category' to create one."
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
        onConfirm={() => handleDelete(deleteConfirm.category.id)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        requireNameMatch
        nameToMatch={deleteConfirm.category?.name || ""}
        loading={loading}
      />
    </PageContainer>
  );
}
