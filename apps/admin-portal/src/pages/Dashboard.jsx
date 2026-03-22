import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Spinner from "../components/ui/Spinner";
import Table from "../components/ui/Table";
import { ORDER_STATUS_COLORS, SCHEDULE_MAP } from "../lib/constants";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getDashboardStats();
      setStats(data.data);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" subtitle="Unable to load dashboard data." />
      </PageContainer>
    );
  }

  const { today, subscriptions, customers, recent_orders, recent_transactions, at_risk_customers } = stats;
  const revenueDelta = today.revenue.today - today.revenue.yesterday;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Today's operations at a glance"
      />

      {/* Alert Bar */}
      {customers.at_risk > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-lg">&#9888;</span>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{customers.at_risk} subscriber{customers.at_risk > 1 ? "s" : ""}</span>{" "}
              with wallet below ₹500 — subscriptions may fail tomorrow.
            </p>
          </div>
          <Link
            to="/customers"
            className="text-sm font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            View at-risk →
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Morning Orders */}
        <StatCard
          label="Morning Orders"
          value={today.orders.morning.count}
          detail={`₹${today.orders.revenue.toFixed(0)} total revenue today`}
          icon="🌅"
          color="bg-orange-50 text-orange-600"
        />
        {/* Evening Orders */}
        <StatCard
          label="Evening Orders"
          value={today.orders.evening.count}
          detail={`${today.orders.total} total orders today`}
          icon="🌆"
          color="bg-indigo-50 text-indigo-600"
        />
        {/* Subscription vs Manual */}
        <StatCard
          label="Subscription Orders"
          value={today.subscription_orders.subscription}
          detail={`${today.subscription_orders.manual} manual orders`}
          icon="🔄"
          color="bg-purple-50 text-purple-600"
        />
        {/* Active Subscriptions */}
        <StatCard
          label="Active Subscriptions"
          value={subscriptions.active}
          detail={Object.entries(subscriptions.by_schedule || {})
            .map(([k, v]) => `${v} ${SCHEDULE_MAP[k] || k}`)
            .join(", ") || "No active schedules"}
          icon="📦"
          color="bg-green-50 text-green-600"
        />
        {/* Today's Revenue */}
        <StatCard
          label="Today's Revenue"
          value={`₹${today.revenue.today.toFixed(0)}`}
          detail={
            revenueDelta >= 0
              ? `+₹${revenueDelta.toFixed(0)} vs yesterday`
              : `-₹${Math.abs(revenueDelta).toFixed(0)} vs yesterday`
          }
          icon="💰"
          color="bg-emerald-50 text-emerald-600"
          detailColor={revenueDelta >= 0 ? "text-green-600" : "text-red-500"}
        />
        {/* Wallet Deposits */}
        <StatCard
          label="Wallet Deposits Today"
          value={`₹${today.wallet_deposits.total.toFixed(0)}`}
          detail={`${today.wallet_deposits.count} top-up${today.wallet_deposits.count !== 1 ? "s" : ""}`}
          icon="💳"
          color="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Subscription Breakdown + Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Subscription Status</h3>
          <div className="space-y-3">
            <BarSegment label="Active" count={subscriptions.active} total={subscriptions.active + subscriptions.paused + subscriptions.cancelled} color="bg-green-500" />
            <BarSegment label="Paused" count={subscriptions.paused} total={subscriptions.active + subscriptions.paused + subscriptions.cancelled} color="bg-yellow-500" />
            <BarSegment label="Cancelled" count={subscriptions.cancelled} total={subscriptions.active + subscriptions.paused + subscriptions.cancelled} color="bg-red-500" />
          </div>
        </div>

        {/* Customer Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Customer Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <MiniStat label="Total Customers" value={customers.total} />
            <MiniStat label="New This Month" value={customers.new_this_month} />
            <MiniStat label="At-Risk (< ₹500)" value={customers.at_risk} alert={customers.at_risk > 0} />
            <MiniStat label="Active Subscribers" value={subscriptions.active} />
          </div>
        </div>
      </div>

      {/* At-Risk Customers */}
      {at_risk_customers && at_risk_customers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">At-Risk Subscribers</h3>
            <span className="text-xs text-gray-500">Wallet below ₹500 with active subscriptions</span>
          </div>
          <Table
            columns={atRiskColumns}
            data={at_risk_customers}
            totalItems={at_risk_customers.length}
            showPagination={false}
            emptyMessage="No at-risk customers."
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>
          <Table
            columns={recentOrderColumns}
            data={recent_orders || []}
            totalItems={(recent_orders || []).length}
            showPagination={false}
            emptyMessage="No recent orders."
          />
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
            <Link to="/finance" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>
          <Table
            columns={recentTransactionColumns}
            data={recent_transactions || []}
            totalItems={(recent_transactions || []).length}
            showPagination={false}
            emptyMessage="No recent transactions."
          />
        </div>
      </div>
    </PageContainer>
  );
}

// --- Sub-Components ---

function StatCard({ label, value, detail, icon, color, detailColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-xl`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {detail && (
        <p className={`text-xs mt-1 ${detailColor || "text-gray-400"}`}>{detail}</p>
      )}
    </div>
  );
}

function BarSegment({ label, count, total, color }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-500">{count} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, alert }) {
  return (
    <div className="text-center p-3 rounded-lg bg-gray-50">
      <p className={`text-2xl font-bold ${alert ? "text-amber-600" : "text-gray-900"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// --- Column Definitions ---

const atRiskColumns = [
  {
    key: "name",
    label: "Customer",
    render: (row) => (
      <Link to={`/customers/${row.id}`} className="text-sm font-medium text-primary-600 hover:underline">
        {row.first_name} {row.last_name}
      </Link>
    ),
  },
  {
    key: "phone",
    label: "Phone",
    render: (row) => <span className="text-sm text-gray-600">{row.phone}</span>,
  },
  {
    key: "wallet",
    label: "Wallet",
    render: (row) => (
      <span className="text-sm font-semibold text-amber-600">₹{row.wallet_balance}</span>
    ),
  },
  {
    key: "subs",
    label: "Active Subs",
    render: (row) => (
      <span className="text-sm text-gray-700">{row.subscriptions?.length || 0}</span>
    ),
  },
];

const recentOrderColumns = [
  {
    key: "id",
    label: "Order",
    render: (row) => (
      <Link to={`/orders/${row.id}`} className="text-sm font-mono text-gray-600 hover:text-primary-600">
        #{row.id?.split("-")[0]?.toUpperCase()}
      </Link>
    ),
  },
  {
    key: "customer",
    label: "Customer",
    render: (row) => (
      <span className="text-sm text-gray-900">
        {row.user?.first_name} {row.user?.last_name}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ORDER_STATUS_COLORS[row.status] || "bg-gray-100"}`}>
        {row.status}
      </span>
    ),
  },
  {
    key: "total",
    label: "Total",
    render: (row) => <span className="text-sm font-medium text-gray-900">₹{row.total_price}</span>,
    headerClassName: "text-right",
    className: "text-right",
  },
];

const recentTransactionColumns = [
  {
    key: "user",
    label: "User",
    render: (row) =>
      row.user ? (
        <Link to={`/customers/${row.user.id}`} className="text-sm text-primary-600 hover:underline font-medium">
          {row.user.first_name} {row.user.last_name}
        </Link>
      ) : (
        <span className="text-sm text-gray-500">Unknown</span>
      ),
  },
  {
    key: "type",
    label: "Type",
    render: (row) => (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800 capitalize">
        {row.type}
      </span>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (row) => (
      <span className={`text-sm font-bold ${row.direction === "credit" ? "text-green-600" : "text-red-600"}`}>
        {row.direction === "credit" ? "+" : "-"}₹{row.amount}
      </span>
    ),
    headerClassName: "text-right",
    className: "text-right",
  },
];
