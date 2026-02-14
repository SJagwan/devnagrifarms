import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../lib/api/orders";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { toast } from "../components/ui/Toaster";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await getOrder(id);
      setOrder(data.data);
    } catch (err) {
      console.error("Failed to load order", err);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status) return;
    
    setUpdating(true);
    try {
      await updateOrderStatus(id, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Order status updated to ${newStatus}`);
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

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
        <Button className="mt-4" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const { shipping_address_snapshot: address } = order;

  return (
    <PageContainer>
      <PageHeader
        title={`Order #${order.id.split("-")[0].toUpperCase()}`}
        subtitle={`Placed on ${new Date(order.created_at).toLocaleString()}`}
        showBack
        onBack={() => navigate("/orders")}
        right={
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
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
        {/* Left Column - Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="p-6 flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                    {/* Placeholder for product image */}
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      IMG
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>
                        {item.variant?.product?.name} ({item.variant?.unit})
                      </h3>
                      <p className="ml-4">₹{item.total_price}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total</p>
                <p>₹{order.total_price}</p>
              </div>
            </div>
          </div>

          {/* Timeline / Notes (Optional placeholder) */}
          {order.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Instructions</h3>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Customer & Address */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {order.user?.first_name?.[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {order.user?.first_name} {order.user?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Customer ID: {order.user_id}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {order.user?.email || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Phone:</span> {order.user?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Details</h3>
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
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Slot:</span> {order.delivery_slot}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Date:</span> {new Date(order.delivery_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
