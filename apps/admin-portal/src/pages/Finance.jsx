import { useState } from "react";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Table from "../components/ui/Table";
import { Link } from "react-router-dom";

const financeColumns = [
  {
    key: "date",
    label: "Date",
    render: (row) => (
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {new Date(row.created_at || row.createdAt).toLocaleString()}
      </span>
    ),
  },
  {
    key: "user",
    label: "User",
    render: (row) =>
      row.user ? (
        <Link to={`/customers/${row.user.id}`} className="text-sm text-primary-600 hover:underline font-medium">
          {row.user.first_name} {row.user.last_name}
        </Link>
      ) : (
        <span className="text-sm text-gray-500">Unknown User</span>
      ),
  },
  {
    key: "type",
    label: "Type",
    render: (row) => (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
        {row.type}
      </span>
    ),
  },
  {
    key: "description",
    label: "Description",
    render: (row) => (
      <span className="text-sm text-gray-500 max-w-xs truncate block" title={row.description}>
        {row.description || "-"}
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
  {
    key: "balance",
    label: "Balance After",
    render: (row) => (
      <span className="text-sm text-gray-500 font-medium">₹{row.balance_after}</span>
    ),
    headerClassName: "text-right",
    className: "text-right",
  },
];

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const fetchTransactions = async (query) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getWalletTransactions({
        page: query.page,
        limit: query.limit,
      });
      setTransactions(data.data.items || []);
      setTotalItems(data.data.meta?.totalItems || 0);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Finance Dashboard"
        subtitle="System-wide wallet transactions and ledger"
      />

      <Table
        columns={financeColumns}
        data={transactions}
        totalItems={totalItems}
        loading={loading}
        showPagination={true}
        onQueryChange={fetchTransactions}
        emptyMessage="No transactions found."
        defaultRowsPerPage={15}
      />
    </PageContainer>
  );
}
