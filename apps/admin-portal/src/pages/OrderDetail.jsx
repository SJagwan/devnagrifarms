import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { ORDER_STATUS_VALUES } from "../lib/constants";

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
      const { data } = await adminAPI.getOrder(id);
      setOrder(data.data);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status) return;
    
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(id, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch {
      // Interceptor handles error toast
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
      {/* Header with controls */}
      <PageHeader
        title={`Order #${order.id.split("-")[0].toUpperCase()}`}
        subtitle={`Placed on ${new Date(order.created_at || order.createdAt).toLocaleString()}`}
        onBack={() => navigate("/orders")}
        right={
          <div className="flex items-center gap-3">
            {(order.status === "delivered" || order.payment_status === "paid") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orders/${order.id}/invoice`)}
              >
                View Invoice
              </Button>
            )}
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className={`rounded-lg text-sm py-2 px-3 border font-semibold capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                order.status === "delivered" ? "bg-green-50 border-green-300 text-green-700" :
                order.status === "cancelled" ? "bg-red-50 border-red-300 text-red-700" :
                order.status === "out_for_delivery" ? "bg-blue-50 border-blue-300 text-blue-700" :
                "bg-yellow-50 border-yellow-300 text-yellow-700"
              }`}
            >
              {ORDER_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Status Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Payment</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
            order.payment_status === "paid" ? "bg-green-100 text-green-700" :
            order.payment_status === "refunded" ? "bg-purple-100 text-purple-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {order.payment_status}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Delivery Slot</p>
          <p className="text-sm font-semibold text-gray-900 capitalize">{order.delivery_slot}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Delivery Date</p>
          <p className="text-sm font-semibold text-gray-900">{new Date(order.delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total</p>
          <p className="text-xs text-gray-400 line-through">₹{(parseFloat(order.total_price) - parseFloat(order.total_tax || 0)).toFixed(2)}</p>
          <p className="text-lg font-bold text-gray-900">₹{order.total_price}</p>
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column — Items + Notes */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="px-6 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.variant?.product?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity} × ₹{item.price} · {item.variant?.unit}
                      {item.tax_amount > 0 && (
                        <span className="ml-2 text-gray-400">
                          + ₹{item.tax_amount} GST ({item.tax_percent}%)
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    ₹{(parseFloat(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="space-y-1.5 max-w-xs ml-auto">
                {parseFloat(order.cgst_total) > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>CGST</span>
                    <span>₹{order.cgst_total}</span>
                  </div>
                )}
                {parseFloat(order.sgst_total) > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>SGST</span>
                    <span>₹{order.sgst_total}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-1.5 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{order.total_price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Notes — always visible */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Delivery Instructions</h3>
            <p className={order.notes ? "text-sm text-gray-700" : "text-sm text-gray-400 italic"}>
              {order.notes || "No special delivery instructions."}
            </p>
          </div>
        </div>

        {/* Right Column — Customer + Delivery */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Customer</h3>
              <Link
                to={`/customers/${order.user_id}`}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
              >
                View Profile
              </Link>
            </div>
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                {order.user?.first_name?.[0]}{order.user?.last_name?.[0]}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {order.user?.first_name} {order.user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{order.user?.phone}</p>
              </div>
            </div>
            {order.user?.email && (
              <p className="text-xs text-gray-500">{order.user.email}</p>
            )}
          </div>

          {/* Delivery Details — address + slot + date */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Delivery Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Slot</span>
                <span className="font-medium text-gray-900 capitalize">{order.delivery_slot}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{new Date(order.delivery_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</p>
                {address ? (
                  <address className="not-italic text-sm text-gray-700 space-y-0.5">
                    <p>{address.address_line_1}</p>
                    {address.address_line_2 && <p>{address.address_line_2}</p>}
                    <p>{address.city}, {address.state} - {address.zip_code}</p>
                  </address>
                ) : (
                  <p className="text-sm text-gray-400 italic">No address available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
