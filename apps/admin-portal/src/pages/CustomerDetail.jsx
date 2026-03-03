import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Modal from "../components/ui/Modal";
import TextField from "../components/ui/TextField";
import { toast } from "../components/ui/Toaster";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  blocked: "bg-red-100 text-red-800",
};

const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

// --- Sub-Components for UI Separation (SRP) ---

const StatCards = ({ user, onAdjustClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-white p-4 rounded-lg shadow sm:p-6 text-center relative flex flex-col justify-center">
      <p className="text-sm font-medium text-gray-500 truncate">Wallet Balance</p>
      <p className="mt-1 text-2xl font-semibold text-green-600">₹{user.wallet_balance}</p>
      <button 
        onClick={onAdjustClick}
        className="mt-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-full self-center transition-colors"
      >
        Adjust Balance
      </button>
    </div>
    <div className="bg-white p-4 rounded-lg shadow sm:p-6 text-center flex flex-col justify-center">
      <p className="text-sm font-medium text-gray-500 truncate">Recent Orders</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{user.orders?.length || 0}</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow sm:p-6 text-center flex flex-col justify-center">
      <p className="text-sm font-medium text-gray-500 truncate">Subscriptions</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{user.subscriptions?.length || 0}</p>
    </div>
  </div>
);

const WalletPassbook = ({ transactions, loading }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">Recent Wallet Activity</h3>
    </div>
    <div className="overflow-x-auto">
      {loading ? (
        <div className="p-6 flex justify-center"><Spinner /></div>
      ) : transactions.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tx.created_at || tx.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]" title={tx.description}>
                  {tx.description || "-"}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                  ["deposit", "refund"].includes(tx.type) ? "text-green-600" :
                  ["purchase", "withdrawal"].includes(tx.type) ? "text-red-600" :
                  "text-blue-600"
                }`}>
                  {["deposit", "refund"].includes(tx.type) ? "+" : ["purchase", "withdrawal"].includes(tx.type) ? "-" : ""}₹{tx.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-6 text-center text-gray-500 italic">No wallet transactions found.</div>
      )}
    </div>
  </div>
);

const SavedAddresses = ({ addresses }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">Saved Addresses</h3>
      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
        {addresses?.length || 0} Total
      </span>
    </div>
    <div className="p-6">
      {addresses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-lg border ${
                addr.is_default ? "border-green-200 bg-green-50" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {addr.address_type}
                </span>
                {addr.is_default && (
                  <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-bold uppercase">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-900 font-medium">{addr.address_line_1}</p>
              {addr.address_line_2 && <p className="text-sm text-gray-600">{addr.address_line_2}</p>}
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.state} - {addr.zip_code}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No addresses saved yet.</p>
      )}
    </div>
  </div>
);

const RecentOrders = ({ orders, userId }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
      <Link to={`/orders?search=${userId}`} className="text-sm text-green-600 hover:text-green-700 font-medium">
        View All
      </Link>
    </div>
    <div className="overflow-x-auto">
      {orders?.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  #{order.id.split("-")[0].toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{order.total_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/orders/${order.id}`} className="text-green-600 hover:text-green-900">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-6 text-center text-gray-500 italic">No orders found.</div>
      )}
    </div>
  </div>
);

const ContactInfo = ({ user, isBlocked, onToggleStatus, blocking }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h3>
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
        <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
        <p className="text-sm font-medium text-gray-900">{user.phone}</p>
        {user.phone_verified_at ? (
            <span className="text-[10px] text-green-600 font-bold">Verified</span>
        ) : (
          <span className="text-[10px] text-yellow-600 font-bold">Unverified</span>
        )}
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
        <p className="text-sm font-medium text-gray-900">{user.email || "N/A"}</p>
        {user.email && (
          user.email_verified_at ? (
            <span className="text-[10px] text-green-600 font-bold">Verified</span>
          ) : (
            <span className="text-[10px] text-yellow-600 font-bold">Unverified</span>
          )
        )}
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Type</label>
        <p className="text-sm font-medium text-gray-900 capitalize">{user.user_type}</p>
      </div>
    </div>

    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
        <Button 
          variant="outline" 
          className={`w-full ${isBlocked ? "text-green-600 border-green-200 hover:bg-green-50" : "text-red-600 border-red-200 hover:bg-red-50"}`} 
          onClick={onToggleStatus}
          loading={blocking}
        >
          {isBlocked ? "Activate User" : "Block User"}
        </Button>
    </div>
  </div>
);

const SubscriptionsList = ({ subscriptions }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Subscriptions</h3>
    {subscriptions?.length > 0 ? (
      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <Link
            key={sub.id}
            to={`/subscriptions/${sub.id}`}
            className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 capitalize">{sub.status}</span>
              <span className="text-xs text-gray-500">{new Date(sub.created_at || sub.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">ID: {sub.id.split("-")[0].toUpperCase()}</p>
          </Link>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500 italic">No active subscriptions.</p>
    )}
  </div>
);

// --- Main Page Component ---

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Wallet State
  const [transactions, setTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjType, setAdjType] = useState("add"); // "add" or "deduct"
  const [adjAmount, setAdjAmount] = useState("");
  const [adjDescription, setAdjDescription] = useState("");
  const [adjLoading, setAdjLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setWalletLoading(true);
    try {
      const [userRes, walletRes] = await Promise.all([
        adminAPI.getUser(id),
        adminAPI.getUserPassbook(id, { limit: 5 })
      ]);
      setUser(userRes.data.data);
      setTransactions(walletRes.data.data.items || []);
    } catch (err) {
      console.error("Failed to load customer data", err);
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
      setWalletLoading(false);
    }
  };

  const fetchPassbookOnly = async () => {
    try {
      const walletRes = await adminAPI.getUserPassbook(id, { limit: 5 });
      setTransactions(walletRes.data.data.items || []);
    } catch (err) {
      console.error("Failed to refresh passbook", err);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = user.status === "blocked" ? "active" : "blocked";
    setBlocking(true);
    try {
      await adminAPI.updateUserStatus(id, newStatus);
      setUser((prev) => ({ ...prev, status: newStatus }));
      toast.success(`User has been ${newStatus === "blocked" ? "blocked" : "activated"}`);
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error(err.response?.data?.message || "Failed to update user status");
    } finally {
      setBlocking(false);
      setShowConfirm(false);
    }
  };

  const handleManualAdjustment = async (e) => {
    e.preventDefault();
    if (!adjAmount || isNaN(adjAmount) || Number(adjAmount) <= 0) {
      return toast.error("Please enter a valid amount");
    }
    if (!adjDescription) {
      return toast.error("Description is required");
    }

    setAdjLoading(true);
    try {
      const amount = adjType === "deduct" ? -Math.abs(Number(adjAmount)) : Math.abs(Number(adjAmount));
      const res = await adminAPI.manualWalletAdjustment(id, {
        amount,
        description: adjDescription
      });
      
      toast.success("Wallet adjusted successfully");
      setShowAdjModal(false);
      setAdjAmount("");
      setAdjDescription("");
      
      // Update balance locally and refresh passbook
      setUser(prev => ({ ...prev, wallet_balance: res.data.data.balance }));
      fetchPassbookOnly();
    } catch (err) {
      console.error("Failed to adjust wallet", err);
      toast.error(err.response?.data?.message || "Failed to adjust wallet");
    } finally {
      setAdjLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Customer not found</h2>
        <Button className="mt-4" onClick={() => navigate("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const joinedDate = user.created_at || user.createdAt;
  const isBlocked = user.status === "blocked";

  return (
    <PageContainer>
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        subtitle={`Joined on ${joinedDate ? new Date(joinedDate).toLocaleDateString() : "N/A"}`}
        showBack
        onBack={() => navigate("/customers")}
        right={
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
              STATUS_COLORS[user.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {user.status}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          <StatCards user={user} onAdjustClick={() => setShowAdjModal(true)} />
          <WalletPassbook transactions={transactions} loading={walletLoading} />
          <SavedAddresses addresses={user.addresses} />
          <RecentOrders orders={user.orders} userId={user.id} />
        </div>

        {/* Right Column - Profile Card */}
        <div className="space-y-6">
          <ContactInfo 
            user={user} 
            isBlocked={isBlocked} 
            blocking={blocking}
            onToggleStatus={() => setShowConfirm(true)} 
          />
          <SubscriptionsList subscriptions={user.subscriptions} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleToggleStatus}
        title={isBlocked ? "Activate Customer?" : "Block Customer?"}
        message={
          isBlocked 
            ? `Are you sure you want to activate ${user.first_name}'s account? They will be able to log in and place orders again.`
            : `Are you sure you want to block ${user.first_name}'s account? They will be immediately logged out and prevented from accessing the platform.`
        }
        confirmText={isBlocked ? "Activate" : "Block"}
        variant={isBlocked ? "info" : "danger"}
        loading={blocking}
      />

      <Modal
        isOpen={showAdjModal}
        onClose={() => !adjLoading && setShowAdjModal(false)}
        title={`Adjust Wallet for ${user.first_name}`}
        size="md"
      >
        <form onSubmit={handleManualAdjustment} className="space-y-4">
          <div className="flex gap-4 mb-2">
            <button
              type="button"
              onClick={() => setAdjType("add")}
              className={`flex-1 py-2 border rounded-md font-medium text-sm transition-colors ${
                adjType === "add" ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Add Funds
            </button>
            <button
              type="button"
              onClick={() => setAdjType("deduct")}
              className={`flex-1 py-2 border rounded-md font-medium text-sm transition-colors ${
                adjType === "deduct" ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Deduct Funds
            </button>
          </div>

          <TextField
            label="Amount (₹)"
            type="number"
            min="1"
            step="0.01"
            value={adjAmount}
            onChange={(e) => setAdjAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <TextField
            label="Description / Reason"
            value={adjDescription}
            onChange={(e) => setAdjDescription(e.target.value)}
            placeholder="e.g. Promotional credit, manual refund..."
            required
          />

          <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs">
            <strong>Note:</strong> This action is irreversible and will immediately update the user's wallet balance. It will be logged in their passbook as an "Adjustment".
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdjModal(false)}
              disabled={adjLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={adjLoading}
              className={adjType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700 text-white"}
            >
              {adjType === "add" ? "Add Funds" : "Deduct Funds"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
