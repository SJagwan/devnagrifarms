import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getSubscription, updateSubscriptionStatus } from "../lib/api/subscriptions";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

const STATUS_OPTIONS = ["active", "paused", "cancelled"];

const SCHEDULE_MAP = {
  d: "Daily",
  a: "Alternate Days",
  w: "Weekly",
};

export default function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSub();
  }, [id]);

  const fetchSub = async () => {
    try {
      const { data } = await getSubscription(id);
      setSub(data.data);
    } catch (err) {
      console.error("Failed to load subscription", err);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === sub.status) return;
    
    setUpdating(true);
    try {
      await updateSubscriptionStatus(id, newStatus);
      setSub((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Subscription updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Subscription not found</h2>
        <Button className="mt-4" onClick={() => navigate("/subscriptions")}>
          Back to List
        </Button>
      </div>
    );
  }

  const { shippingAddress: address } = sub;

  return (
    <PageContainer>
      <PageHeader
        title={sub.subscription_name || "Custom Plan"}
        subtitle={`ID: #${sub.id.split("-")[0].toUpperCase()}`}
        showBack
        onBack={() => navigate("/subscriptions")}
        right={
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select
              value={sub.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className={`block w-40 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border font-bold capitalize ${
                sub.status === 'active' ? 'text-green-700 bg-green-50' :
                sub.status === 'paused' ? 'text-yellow-700 bg-yellow-50' : 
                'text-red-700 bg-red-50'
              }`}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Plan & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Details Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Frequency</p>
                <p className="font-medium text-gray-900">
                  {SCHEDULE_MAP[sub.schedule_type] || sub.schedule_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Slot</p>
                <p className="font-medium text-gray-900 capitalize">{sub.delivery_slot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(sub.start_date).toLocaleDateString()}
                </p>
              </div>
              {sub.next_delivery_date && (
                <div>
                  <p className="text-sm text-gray-500">Next Delivery</p>
                  <p className="font-medium text-green-600">
                    {new Date(sub.next_delivery_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Items per Delivery</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {sub.items.map((item) => (
                <li key={item.id} className="p-6 flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">
                    {item.quantity}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.variant?.product?.name}</h3>
                      <p>₹{item.price * item.quantity}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.variant?.unit} • ₹{item.price}/{item.variant?.unit}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Customer & Address */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {sub.user?.first_name?.[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {sub.user?.first_name} {sub.user?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">User ID: {sub.user_id}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {sub.user?.email || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Phone:</span> {sub.user?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
            {address ? (
              <address className="not-italic text-sm text-gray-600 space-y-1">
                <p>{address.address_line_1}</p>
                {address.address_line_2 && <p>{address.address_line_2}</p>}
                <p>
                  {address.city}, {address.state} - {address.zip_code}
                </p>
              </address>
            ) : (
              <p className="text-sm text-gray-500">No address details available.</p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
