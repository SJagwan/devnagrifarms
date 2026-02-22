import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../lib/api/orders";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async (query) => {
    try {
      setLoading(true);
      const params = { 
        page: query.page, 
        limit: query.limit,
        status: query.filters?.status || undefined,
        search: query.search || undefined,
      };
      const response = await getOrders(params);
      const { items, meta } = response.data.data;
      setOrders(items || []);
      if (meta) setTotalItems(meta.totalItems);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Order ID",
      render: (row) => (
        <span className="font-mono text-sm text-gray-600">
          #{row.id.split("-")[0].toUpperCase()}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.user?.first_name} {row.user?.last_name}
          </div>
          <div className="text-xs text-gray-500">{row.user?.phone}</div>
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
      key: "amount",
      label: "Total",
      render: (row) => `₹${row.total_price}`,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/orders/${row.id}`)}
          >
            View Details
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
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Orders"
        subtitle="Manage customer orders"
      />
      
      <Table
        columns={columns}
        data={orders}
        totalItems={totalItems}
        loading={loading}
        enableSorting={false}
        showPagination={true}
        enableSearch={true}
        searchPlaceholder="Search by Order ID..."
        filters={tableFilters}
        onQueryChange={fetchOrders}
        emptyMessage={'No orders found.'}
      />
    </PageContainer>
  );
}
