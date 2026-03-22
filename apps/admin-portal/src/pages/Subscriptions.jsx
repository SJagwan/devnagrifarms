import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_OPTIONS, SCHEDULE_MAP } from "../lib/constants";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSubscriptions = async (query) => {
    try {
      setLoading(true);
      const params = { 
        page: query.page, 
        limit: query.limit,
        status: query.filters?.status || undefined,
        search: query.search || undefined,
      };
      const response = await adminAPI.getSubscriptions(params);
      const { items, meta } = response.data.data;
      setSubscriptions(items || []);
      if (meta) setTotalItems(meta.totalItems);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Plan Name",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.subscription_name || "Custom Plan"}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => (
        <div>
          <div className="text-gray-900">
            {row.user?.first_name} {row.user?.last_name}
          </div>
          <div className="text-xs text-gray-500">{row.user?.phone}</div>
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Frequency",
      render: (row) => (
        <span className="text-sm text-gray-700">
          {SCHEDULE_MAP[row.schedule_type] || row.schedule_type}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
            SUBSCRIPTION_STATUS_COLORS[row.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (row) => new Date(row.start_date).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/subscriptions/${row.id}`)}
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
      options: SUBSCRIPTION_STATUS_OPTIONS,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Subscriptions"
        subtitle="Manage recurring delivery plans"
      />
      
      <Table
        columns={columns}
        data={subscriptions}
        totalItems={totalItems}
        loading={loading}
        enableSorting={false}
        showPagination={true}
        enableSearch={true}
        searchPlaceholder="Search by Plan Name or ID..."
        filters={tableFilters}
        onQueryChange={fetchSubscriptions}
        emptyMessage={'No subscriptions found.'}
      />
    </PageContainer>
  );
}
