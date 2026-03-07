import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RazorpayCheckout from "react-native-razorpay";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";
import { customerAPI } from "@lib/api";
import { walletApi } from "../../wallet/api/walletApi";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getAvailableDates(count = 7) {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      date: d,
      iso: d.toISOString().split("T")[0],
      day: DAY_NAMES[d.getDay()],
      dateNum: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      label: i === 1 ? "Tomorrow" : null,
    });
  }
  return dates;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, refreshUser } = useAuth();

  const availableDates = getAvailableDates(7);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState("morning");
  const [deliveryDate, setDeliveryDate] = useState(availableDates[0].iso);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: "processing",
    title: "",
    message: "",
    buttonText: "",
    onAction: null,
  });

  const [serviceability, setServiceability] = useState(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);

  useEffect(() => {
    fetchAddresses();
    refreshUser();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await customerAPI.getAddresses();
      const addrList = res.data.data;
      setAddresses(addrList);
      const defaultAddr = addrList.find((a) => a.is_default);
      const selected = defaultAddr || addrList[0];
      if (selected) {
        setSelectedAddressId(selected.id);
        checkServiceabilityForAddress(selected);
      }
    } catch (e) {
      console.error("Failed to fetch addresses", e);
      showError("Connection Error", "Could not load your saved addresses.");
    } finally {
      setLoading(false);
    }
  };

  const checkServiceabilityForAddress = useCallback(async (addr) => {
    if (!addr?.latitude || !addr?.longitude) {
      setServiceability({ serviceable: false, message: "Address has no location data" });
      return;
    }
    setCheckingServiceability(true);
    setServiceability(null);
    try {
      const res = await customerAPI.checkServiceability({
        latitude: addr.latitude,
        longitude: addr.longitude,
      });
      setServiceability({
        serviceable: res.data.data?.serviceable ?? false,
        message: res.data.data?.message || (res.data.data?.serviceable ? "Delivery available" : "Not serviceable"),
      });
    } catch (e) {
      console.error("Serviceability check failed", e);
      setServiceability({ serviceable: true, message: "Could not verify serviceability" });
    } finally {
      setCheckingServiceability(false);
    }
  }, []);

  const showError = (title, message) => {
    setModalConfig({
      type: "error",
      title,
      message,
      buttonText: "Okay",
      onAction: () => setModalVisible(false),
    });
    setModalVisible(true);
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    checkServiceabilityForAddress(addr);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return showError("Required", "Please select a delivery address");
    if (serviceability && !serviceability.serviceable) return showError("Not Serviceable", "Please select an address within our delivery area");
    if (cartItems.length === 0) return showError("Empty Cart", "Your cart is empty");

    if (paymentMethod === "wallet" && (user?.wallet_balance || 0) < cartTotal) {
      setModalConfig({
        type: "balance",
        title: "Insufficient Balance",
        message: `You need ₹${(cartTotal - (user?.wallet_balance || 0)).toFixed(2)} more to complete this order.`,
        buttonText: "Top-up Wallet",
        onAction: () => {
          setModalVisible(false);
          router.push("/wallet/add-funds");
        },
      });
      setModalVisible(true);
      return;
    }

    setModalConfig({ type: "processing", title: "Placing Order", message: "Hang tight, we're confirming your produce..." });
    setModalVisible(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        shippingAddressId: selectedAddressId,
        deliverySlot,
        deliveryDate,
        paymentMethod,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      if (paymentMethod === "wallet") {
        const res = await customerAPI.createOrder(payload);
        await finishOrder(res.data.data);
      } else {
        const orderRes = await walletApi.createAddFundsOrder(cartTotal);
        const { gatewayOrderId, amount: rzpAmount, currency, keyId } = orderRes.data;

        const options = {
          description: "Order Payment",
          currency: currency,
          key: keyId,
          amount: rzpAmount.toString(),
          name: "Devnagri Farms",
          order_id: gatewayOrderId,
          prefill: {
            email: user?.email,
            contact: user?.phone,
            name: user?.first_name + " " + user?.last_name,
          },
          theme: { color: "#16a34a" },
        };

        RazorpayCheckout.open(options)
          .then(async (data) => {
            await walletApi.verifyPayment({
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
            });
            const res = await customerAPI.createOrder({ ...payload, paymentMethod: 'wallet' });
            await finishOrder(res.data.data);
          })
          .catch(() => {
            setModalVisible(false);
            showError("Payment Failed", "Could not complete online payment.");
          });
      }
    } catch (e) {
      setModalVisible(false);
      const msg = e.response?.data?.message || "Failed to place order";
      showError("Order Failed", msg);
    }
  };

  const finishOrder = async (order) => {
    await clearCart();
    setModalVisible(false);
    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    const addressLine = selectedAddr ? `${selectedAddr.address_line_1}, ${selectedAddr.city}` : "";

    router.replace({
      pathname: "/checkout/success",
      params: {
        orderId: order?.id || "",
        deliveryDate,
        addressLine,
      },
    });
  };

  const canPlaceOrder =
    selectedAddressId &&
    cartItems.length > 0 &&
    (!serviceability || serviceability.serviceable) &&
    !checkingServiceability;

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white w-full rounded-[32px] p-8 items-center shadow-2xl">
            {modalConfig.type === "processing" ? (
              <ActivityIndicator size="large" color="#16a34a" className="mb-6" />
            ) : (
              <View className={`w-16 h-16 rounded-full items-center justify-center mb-6 ${modalConfig.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
                <Ionicons 
                  name={modalConfig.type === 'error' ? 'alert-circle' : 'wallet'} 
                  size={32} 
                  color={modalConfig.type === 'error' ? '#dc2626' : '#16a34a'} 
                />
              </View>
            )}
            
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">{modalConfig.title}</Text>
            <Text className="text-gray-500 text-center leading-5 mb-8">{modalConfig.message}</Text>

            {modalConfig.type !== "processing" && (
              <View className="flex-row gap-3 w-full">
                <Pressable 
                  onPress={modalConfig.onAction}
                  className={`flex-1 py-4 rounded-2xl items-center ${modalConfig.type === 'error' ? 'bg-gray-100' : 'bg-green-600'}`}
                >
                  <Text className={`font-bold ${modalConfig.type === 'error' ? 'text-gray-900' : 'text-white'}`}>{modalConfig.buttonText}</Text>
                </Pressable>
                {modalConfig.type === 'balance' && (
                  <Pressable onPress={() => setModalVisible(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl items-center">
                    <Text className="text-gray-500 font-bold">Cancel</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <View className="bg-white px-4 py-4 flex-row items-center shadow-sm">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-gray-900 mb-3">Delivery Address</Text>
        {addresses.length === 0 ? (
          <View className="bg-white p-6 rounded-xl items-center mb-6">
            <Text className="text-gray-500 mb-4">No addresses found</Text>
            <Pressable className="bg-green-600 px-6 py-3 rounded-lg" onPress={() => router.push("/address/add")}>
              <Text className="text-white font-medium">Add New Address</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mb-4">
            {addresses.map((addr) => (
              <Pressable
                key={addr.id}
                onPress={() => handleSelectAddress(addr)}
                className="p-4 rounded-2xl mb-3 border"
                style={{
                  backgroundColor: selectedAddressId === addr.id ? "#f0fdf4" : "white",
                  borderColor: selectedAddressId === addr.id ? "#16a34a" : "#e5e7eb",
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">{addr.address_type}</Text>
                    <Text className="text-gray-600 mt-1">{addr.address_line_1}, {addr.city}, {addr.state}</Text>
                    <Text className="text-gray-500 text-xs mt-1">{addr.zip_code}</Text>
                  </View>
                  {selectedAddressId === addr.id && <Ionicons name="checkmark-circle" size={24} color="#16a34a" />}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {selectedAddressId && (
          <View className="mb-6">
            {checkingServiceability ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#16a34a" />
                <Text className="text-gray-500 ml-2 text-sm">Checking delivery availability...</Text>
              </View>
            ) : serviceability ? (
              <View className="flex-row items-center">
                <Ionicons name={serviceability.serviceable ? "checkmark-circle" : "alert-circle"} size={18} color={serviceability.serviceable ? "#16a34a" : "#EF4444"} />
                <Text className="ml-2 text-sm font-medium" style={{ color: serviceability.serviceable ? "#16a34a" : "#ef4444" }}>{serviceability.message}</Text>
              </View>
            ) : null}
          </View>
        )}

        <Text className="text-lg font-bold text-gray-900 mb-3">Delivery Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {availableDates.map((d) => (
            <Pressable
              key={d.iso}
              onPress={() => setDeliveryDate(d.iso)}
              className="mr-3 px-4 py-3 rounded-2xl border items-center min-w-[70px]"
              style={{
                backgroundColor: deliveryDate === d.iso ? "#16a34a" : "white",
                borderColor: deliveryDate === d.iso ? "#16a34a" : "#e5e7eb",
              }}
            >
              <Text className="text-xs font-medium" style={{ color: deliveryDate === d.iso ? "#dcfce7" : "#9ca3af" }}>{d.label || d.day}</Text>
              <Text className="text-xl font-bold" style={{ color: deliveryDate === d.iso ? "white" : "#111827" }}>{d.dateNum}</Text>
              <Text className="text-xs" style={{ color: deliveryDate === d.iso ? "#dcfce7" : "#6b7280" }}>{d.month}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text className="text-lg font-bold text-gray-900 mb-3">Delivery Slot</Text>
        <View className="flex-row mb-6">
          <Pressable
            onPress={() => setDeliverySlot("morning")}
            className="flex-1 p-4 rounded-2xl mr-2 border items-center"
            style={{
              backgroundColor: deliverySlot === "morning" ? "#16a34a" : "white",
              borderColor: deliverySlot === "morning" ? "#16a34a" : "#e5e7eb",
            }}
          >
            <Ionicons name="sunny" size={24} color={deliverySlot === "morning" ? "white" : "gray"} />
            <Text className="mt-2 font-bold" style={{ color: deliverySlot === "morning" ? "white" : "#4b5563" }}>Morning</Text>
            <Text className="text-xs" style={{ color: deliverySlot === "morning" ? "#dcfce7" : "#9ca3af" }}>6 AM - 9 AM</Text>
          </Pressable>
          <Pressable
            onPress={() => setDeliverySlot("evening")}
            className="flex-1 p-4 rounded-2xl ml-2 border items-center"
            style={{
              backgroundColor: deliverySlot === "evening" ? "#16a34a" : "white",
              borderColor: deliverySlot === "evening" ? "#16a34a" : "#e5e7eb",
            }}
          >
            <Ionicons name="moon" size={24} color={deliverySlot === "evening" ? "white" : "gray"} />
            <Text className="mt-2 font-bold" style={{ color: deliverySlot === "evening" ? "white" : "#4b5563" }}>Evening</Text>
            <Text className="text-xs" style={{ color: deliverySlot === "evening" ? "#dcfce7" : "#9ca3af" }}>5 PM - 8 PM</Text>
          </Pressable>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-3">Payment Method</Text>
        <View className="mb-2">
          <Pressable
            onPress={() => setPaymentMethod("wallet")}
            className="bg-white p-4 rounded-2xl mb-3 border flex-row items-center justify-between"
            style={{ 
              borderColor: paymentMethod === "wallet" ? "#16a34a" : "#e5e7eb",
              backgroundColor: paymentMethod === "wallet" ? "#f0fdf4" : "white"
            }}
          >
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${paymentMethod === "wallet" ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Ionicons name="wallet" size={20} color={paymentMethod === "wallet" ? "#16a34a" : "#6b7280"} />
              </View>
              <View className="ml-3">
                <Text className="font-bold text-gray-900">Pay via Wallet</Text>
                <Text className={`text-xs ${user?.wallet_balance < cartTotal ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  Balance: ₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}
                </Text>
              </View>
            </View>
            {paymentMethod === "wallet" && <Ionicons name="checkmark-circle" size={24} color="#16a34a" />}
          </Pressable>

          <Pressable
            onPress={() => setPaymentMethod("online")}
            className="bg-white p-4 rounded-2xl border flex-row items-center justify-between"
            style={{ 
              borderColor: paymentMethod === "online" ? "#16a34a" : "#e5e7eb",
              backgroundColor: paymentMethod === "online" ? "#f0fdf4" : "white"
            }}
          >
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${paymentMethod === "online" ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Ionicons name="card" size={20} color={paymentMethod === "online" ? "#16a34a" : "#6b7280"} />
              </View>
              <View className="ml-3">
                <Text className="font-bold text-gray-900">Online Payment (Instant)</Text>
                <Text className="text-gray-500 text-xs">UPI, Cards, Netbanking</Text>
              </View>
            </View>
            {paymentMethod === "online" && <Ionicons name="checkmark-circle" size={24} color="#16a34a" />}
          </Pressable>
        </View>

        {paymentMethod === "online" && (
          <View className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex-row mb-6 items-start">
            <Ionicons name="information-circle" size={20} color="#1e40af" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-900 font-bold text-sm mb-1">Seamless Checkout</Text>
              <Text className="text-blue-800 text-xs leading-4">
                This will top up your wallet and automatically place the order. One-click tracking in your passbook!
              </Text>
            </View>
          </View>
        )}
        
        {paymentMethod === "wallet" && (user?.wallet_balance || 0) >= cartTotal && <View className="h-6" />}

        <Text className="text-lg font-bold text-gray-900 mb-3">Summary</Text>
        <View className="bg-white p-4 rounded-2xl mb-8 border border-gray-200">
          {cartItems.map((item) => (
            <View key={item.variant.id} className="flex-row justify-between mb-2">
              <Text className="text-gray-600 flex-1" numberOfLines={1}>{item.variant.product?.name || "Item"} × {item.quantity}</Text>
              <Text className="font-medium text-gray-900 ml-2">₹{(item.variant.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View className="h-px bg-gray-100 my-2" />
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Item Total</Text>
            <Text className="font-medium text-gray-900">₹{cartTotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Delivery Fee</Text>
            <Text className="font-medium text-green-600">Free</Text>
          </View>
          <View className="h-px bg-gray-100 my-2" />
          <View className="flex-row justify-between">
            <Text className="font-bold text-lg text-gray-900">To Pay</Text>
            <Text className="font-bold text-lg text-green-600">₹{cartTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-100">
        <Pressable
          onPress={handlePlaceOrder}
          disabled={!canPlaceOrder}
          className="py-4 rounded-2xl items-center"
          style={{ backgroundColor: !canPlaceOrder ? "#e5e7eb" : "#16a34a" }}
        >
          <Text className={`font-bold text-xl ${!canPlaceOrder ? 'text-gray-400' : 'text-white'}`}>Place Order</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
