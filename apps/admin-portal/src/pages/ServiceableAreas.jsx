import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import TextField from "../components/ui/TextField";
import Table from "../components/ui/Table";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import PolygonMapEditor from "../components/ui/PolygonMapEditor";

export default function ServiceableAreas() {
  const [areas, setAreas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [queryState, setQueryState] = useState({ page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    area: null,
  });
  const [form, setForm] = useState({
    name: "",
    coordinates: "",
  });

  useEffect(() => {
    fetchAreas(queryState);
  }, [queryState]);

  const fetchAreas = async (query) => {
    try {
      setLoading(true);
      const params = {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        sortBy: query.sortBy || undefined,
        sortDir: query.sortDir || undefined,
      };
      const { data } = await adminAPI.getServiceableAreas(params);
      setAreas(data.data || []);
      if (data.meta) setTotalItems(data.meta.totalItems);
    } catch (err) {
      console.error("Failed to load serviceable areas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableQueryChange = (query) => {
    setQueryState(query);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMapChange = (geoJSON) => {
    setForm((prev) => ({ ...prev, coordinates: geoJSON }));
  };

  const handleOpenCreate = () => {
    setEditingArea(null);
    setForm({ name: "", coordinates: null });
    setShowModal(true);
  };

  const handleOpenEdit = (area) => {
    setEditingArea(area);
    setForm({
      name: area.name,
      coordinates: area.coordinates || null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        coordinates: form.coordinates,
      };

      if (editingArea) {
        await adminAPI.updateServiceableArea(editingArea.id, payload);
      } else {
        await adminAPI.createServiceableArea(payload);
      }

      setShowModal(false);
      setForm({ name: "", coordinates: null });
      setEditingArea(null);
      setQueryState((prev) => ({ ...prev, page: 1 }));
    } catch (e) {
      console.error("Failed to save serviceable area", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (area) => {
    setDeleteConfirm({ open: true, area });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.area) return;
    try {
      setLoading(true);
      await adminAPI.deleteServiceableArea(deleteConfirm.area.id);
      setDeleteConfirm({ open: false, area: null });
      fetchAreas(queryState);
    } catch (e) {
      console.error("Failed to delete serviceable area", e);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Area Name",
      sortKey: "name",
      render: (row) => (
        <div className="text-sm font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortKey: "created_at",
      render: (row) => {
        const date = row.createdAt ? new Date(row.createdAt) : null;
        const isValidDate = date && !isNaN(date.getTime());
        return (
          <div className="text-sm text-gray-700">
            {isValidDate ? date.toLocaleDateString() : "N/A"}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(row)}
          >
            Delete
          </Button>
        </div>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Serviceable Areas"
        subtitle="Manage delivery zones and service areas"
        right={
          <Button onClick={handleOpenCreate} variant="primary">
            + Add Area
          </Button>
        }
      />

      <Table
        columns={columns}
        data={areas}
        totalItems={totalItems}
        loading={loading}
        enableSearch={true}
        searchPlaceholder="Search areas..."
        enableSorting={true}
        showRowsPerPage={true}
        showPagination={true}
        onQueryChange={handleTableQueryChange}
        emptyMessage="No serviceable areas yet. Click 'Add Area' to create one."
        initialSort={{ sortBy: "name", sortDir: "ASC" }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingArea ? "Edit Serviceable Area" : "Add Serviceable Area"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Area Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Downtown Dehradun, Rajpur Road Area"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Area Boundary *
            </label>
            <PolygonMapEditor
              key={editingArea?.id || "new"}
              initialCoordinates={form.coordinates}
              onChange={handleMapChange}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={!form.coordinates}
            >
              {editingArea ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, area: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Serviceable Area"
        message={`Are you sure you want to delete "${deleteConfirm.area?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        requireNameMatch={false}
        variant="danger"
      />
    </PageContainer>
  );
}
