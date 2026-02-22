import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  blocked: "bg-red-100 text-red-800",
};

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async (query) => {
    try {
      setLoading(true);
      const params = {
        page: query.page,
        limit: query.limit,
        status: query.filters?.status || undefined,
        userType: "customer",
        search: query.search || undefined,
      };
      const response = await adminAPI.getUsers(params);
      const { items, meta } = response.data.data;
      setUsers(items || []);
      if (meta) setTotalItems(meta.totalItems);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.first_name} {row.last_name}
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (row) => (
        <div>
          <div className="text-sm text-gray-900">{row.phone}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
            STATUS_COLORS[row.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "wallet",
      label: "Wallet",
      render: (row) => `₹${row.wallet_balance}`,
    },
    {
      key: "date",
      label: "Joined",
      render: (row) => {
        const date = row.created_at || row.createdAt;
        return date ? new Date(date).toLocaleDateString() : "N/A";
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
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            View Profile
          </Button>
        </div>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
  ];

  const tableFilters = [
    {
      key: "status",
      label: "Filter by Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Blocked", value: "blocked" },
      ],
    },
  ];

  return (
    <PageContainer>
      <PageHeader title="Customers" subtitle="Manage your platform users" />

      <Table
        columns={columns}
        data={users}
        totalItems={totalItems}
        loading={loading}
        enableSorting={false}
        showPagination={true}
        enableSearch={true}
        searchPlaceholder="Search by name, email, or phone..."
        filters={tableFilters}
        onQueryChange={fetchUsers}
        emptyMessage={"No users found."}
      />
    </PageContainer>
  );
}
