import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    default_tax: "0",
  });

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data } = await adminAPI.getCategories();
      setCategories(data.data || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getProduct(id);
      const p = data.data;
      setForm({
        name: p.name || "",
        description: p.description || "",
        category_id: p.category_id || p.category?.id || "",
        default_tax: String(p.default_tax ?? "0"),
      });
    } catch (e) {
      console.error("Failed to load product", e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.updateProduct(id, {
        name: form.name,
        description: form.description,
        category_id: form.category_id,
        default_tax: form.default_tax,
      });
      navigate("/products");
    } catch (e) {
      console.error("Failed to update product", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader title="Edit Product" subtitle="Update product information" />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Product Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category_id}
              onChange={(e) => handleChange("category_id", e.target.value)}
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
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
