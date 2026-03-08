import { useState, useEffect } from "react";
import { adminAPI } from "../lib/api/requests";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ImageUpload from "../components/ui/ImageUpload";
import { getPublicImageUrl } from "../lib/storage";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [lastQuery, setLastQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    position: "HOME_CAROUSEL",
    audience: "ALL",
    title: "",
    subtitle: "",
    image_url: "",
    cta_text: "Shop Now",
    link_type: "NONE",
    link_id: "",
    external_url: "",
    display_order: 0,
    is_active: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    banner: null,
  });

  const fetchBanners = async (query) => {
    try {
      setLoading(true);
      const params = {
        page: query.page,
        limit: query.limit,
        search: query.search || "",
      };
      const { data } = await adminAPI.getBanners(params);
      setBanners(data.data?.items || []);
      setTotal(data.data?.meta?.totalItems || 0);
    } catch (error) {
      console.error("Failed to load banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        display_order: Number(formData.display_order),
        link_id: formData.link_id || null,
        external_url: formData.external_url || null,
      };

      if (editingId) {
        await adminAPI.updateBanner(editingId, payload);
      } else {
        await adminAPI.createBanner(payload);
      }
      handleCancel();
      fetchBanners(lastQuery);
    } catch (error) {
      console.error("Failed to save banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      position: banner.position,
      audience: banner.audience,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      cta_text: banner.cta_text || "Shop Now",
      link_type: banner.link_type,
      link_id: banner.link_id || "",
      external_url: banner.external_url || "",
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await adminAPI.deleteBanner(id);
      setDeleteConfirm({ isOpen: false, banner: null });
      fetchBanners(lastQuery);
    } catch (error) {
      alert(error.message || "Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      position: "HOME_CAROUSEL",
      audience: "ALL",
      title: "",
      subtitle: "",
      image_url: "",
      cta_text: "Shop Now",
      link_type: "NONE",
      link_id: "",
      external_url: "",
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleTableQueryChange = (query) => {
    setLastQuery(query);
    fetchBanners(query);
  };

  const columns = [
    {
      key: "image",
      label: "Preview",
      render: (row) => (
        <img
          src={getPublicImageUrl(row.image_url)}
          alt={row.title}
          className="w-20 h-12 object-cover rounded shadow-sm border border-gray-100"
        />
      ),
    },
    {
      key: "title",
      label: "Title / Position",
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row.title || "No Title"}</div>
          <div className="text-xs text-gray-500 font-mono">{row.position}</div>
        </div>
      ),
    },
    {
      key: "audience",
      label: "Audience",
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.audience === 'ALL' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
        }`}>
          {row.audience}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: "display_order",
      label: "Order",
      className: "text-center",
      render: (row) => <span className="text-sm text-gray-600">{row.display_order}</span>,
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
            onClick={() => setDeleteConfirm({ isOpen: true, banner: row })}
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
        title="Banners"
        subtitle="Manage home screen carousels and promos"
        right={
          <Button onClick={() => setShowForm(true)}>+ Add Banner</Button>
        }
      />

      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingId ? "Edit Banner" : "Add New Banner"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="HOME_CAROUSEL">Home Carousel</option>
                <option value="HOME_STRIP">Home Strip</option>
                <option value="CART_PROMO">Cart Promo</option>
                <option value="SUB_OFFER">Subscription Offer</option>
                <option value="PRODUCT_PAGE">Product Page</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Users</option>
                <option value="NEW_USERS">New Users</option>
                <option value="EXISTING_USERS">Existing Users</option>
                <option value="NON_SUBSCRIBERS">Non-Subscribers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Fresh Harvest"
            />
            <TextField
              label="Subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Up to 30% OFF"
            />
          </div>

          <ImageUpload
            label="Banner Image"
            value={formData.image_url}
            onChange={(key) => setFormData({ ...formData, image_url: key })}
            prefix="banners"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="CTA Text"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              placeholder="Shop Now"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4 border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Type</label>
                <select
                  value={formData.link_type}
                  onChange={(e) => setFormData({ ...formData, link_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="NONE">No Link</option>
                  <option value="PRODUCT">Product</option>
                  <option value="CATEGORY">Category</option>
                  <option value="EXTERNAL">External URL</option>
                </select>
              </div>

              {formData.link_type === 'EXTERNAL' ? (
                <TextField
                  label="External URL"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://..."
                />
              ) : formData.link_type !== 'NONE' ? (
                <TextField
                  label={`${formData.link_type} ID (UUID)`}
                  value={formData.link_id}
                  onChange={(e) => setFormData({ ...formData, link_id: e.target.value })}
                  placeholder="Enter UUID"
                />
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
              Active (Visible to users)
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {editingId ? "Update Banner" : "Create Banner"}
            </Button>
          </div>
        </form>
      </Modal>

      <Table
        columns={columns}
        data={banners}
        onQueryChange={handleTableQueryChange}
        totalItems={total}
        loading={loading}
        emptyMessage="No banners found. Create one to improve your app's engagement!"
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, banner: null })}
        onConfirm={() => handleDelete(deleteConfirm.banner.id)}
        title="Delete Banner"
        message={`Are you sure you want to delete this banner? This will remove it from all users' screens.`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </PageContainer>
  );
}
