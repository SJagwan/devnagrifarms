import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { ORDER_STATUS_COLORS, ORDER_STATUS_OPTIONS } from "../lib/constants";

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
      const response = await adminAPI.getOrders(params);
      const { items, meta } = response.data.data;
      setOrders(items || []);
      if (meta) setTotalItems(meta.totalItems);
    } catch {
      // Interceptor handles error toast
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
            ORDER_STATUS_COLORS[row.status] || "bg-gray-100 text-gray-800"
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
      options: ORDER_STATUS_OPTIONS,
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
