import { useState, useEffect } from "react";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Spinner from "../components/ui/Spinner";
import { toast } from "../components/ui/Toaster";
import { Link } from "react-router-dom";

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  const fetchTransactions = async (pageToFetch) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getWalletTransactions({ page: pageToFetch, limit: 15 });
      setTransactions(data.data.items || []);
      setMeta(data.data.meta);
    } catch (err) {
      console.error("Failed to load transactions", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionColor = (type, amount) => {
    if (type === "deposit" || type === "refund") return "text-green-600";
    if (type === "purchase" || type === "withdrawal") return "text-red-600";
    // Adjustment could be positive or negative
    return "text-blue-600";
  };

  const getTransactionSign = (type) => {
    if (type === "deposit" || type === "refund") return "+";
    if (type === "purchase" || type === "withdrawal") return "-";
    return "";
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Finance Dashboard" 
        subtitle="System-wide wallet transactions and ledger"
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.created_at || tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.user ? (
                          <Link to={`/customers/${tx.user.id}`} className="text-sm text-primary-600 hover:underline font-medium">
                            {tx.user.first_name} {tx.user.last_name}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">Unknown User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={tx.description}>
                        {tx.description || "-"}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${getTransactionColor(tx.type, tx.amount)}`}>
                        {getTransactionSign(tx.type)}₹{tx.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
                        ₹{tx.balance_after}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{meta.page}</span> of <span className="font-medium">{meta.totalPages}</span> ({meta.totalItems} total transactions)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
