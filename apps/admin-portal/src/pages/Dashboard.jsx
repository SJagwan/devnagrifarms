import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Table from "../components/ui/Table";

export default function Dashboard() {
  const stats = [
    {
      label: "Total Orders",
      value: "1,234",
      change: "+12%",
      icon: "📦",
      color: "primary",
    },
    {
      label: "Revenue",
      value: "₹45,678",
      change: "+8%",
      icon: "💰",
      color: "secondary",
    },
    {
      label: "Customers",
      value: "567",
      change: "+23%",
      icon: "👥",
      color: "accent",
    },
    {
      label: "Active Subscriptions",
      value: "89",
      change: "+5%",
      icon: "🔔",
      color: "primary",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Rajesh Kumar",
      items: "5 items",
      amount: "₹1,250",
      status: "Delivered",
    },
    {
      id: "ORD-002",
      customer: "Priya Sharma",
      items: "3 items",
      amount: "₹890",
      status: "In Transit",
    },
    {
      id: "ORD-003",
      customer: "Amit Patel",
      items: "7 items",
      amount: "₹2,100",
      status: "Pending",
    },
    {
      id: "ORD-004",
      customer: "Sneha Reddy",
      items: "4 items",
      amount: "₹1,500",
      status: "Confirmed",
    },
  ];

  const getColorClass = (color, type = "bg") => {
    const colorMap = {
      primary:
        type === "bg" ? "bg-primary-100 text-primary-600" : "text-primary-600",
      secondary:
        type === "bg"
          ? "bg-secondary-100 text-secondary-600"
          : "text-secondary-600",
      accent:
        type === "bg" ? "bg-accent-100 text-accent-600" : "text-accent-600",
    };
    return colorMap[color] || colorMap.primary;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "In Transit":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-primary-100 text-primary-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg ${getColorClass(
                  stat.color
                )} flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
              <span className="text-sm font-semibold text-green-600">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <button className="text-primary-600 hover:text-primary-800 font-medium text-sm cursor-pointer">
            View all orders →
          </button>
        </div>
        <Table
          columns={[
            { key: "id", label: "Order ID", render: (row) => <span className="text-sm font-medium text-gray-900">{row.id}</span> },
            { key: "customer", label: "Customer", render: (row) => <span className="text-sm text-gray-900">{row.customer}</span> },
            { key: "items", label: "Items", render: (row) => <span className="text-sm text-gray-600">{row.items}</span> },
            { key: "amount", label: "Amount", render: (row) => <span className="text-sm font-semibold text-gray-900">{row.amount}</span> },
            { key: "status", label: "Status", render: (row) => (
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(row.status)}`}>
                {row.status}
              </span>
            )},
            { key: "actions", label: "Action", render: () => (
              <button className="text-primary-600 hover:text-primary-800 font-medium text-sm cursor-pointer">View</button>
            ), headerClassName: "text-right", className: "text-right" },
          ]}
          data={recentOrders}
          totalItems={recentOrders.length}
          showPagination={false}
          emptyMessage="No recent orders."
        />
      </div>
    </PageContainer>
  );
}
