import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@context/CartContext";
import { customerAPI } from "@lib/api";

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

  const availableDates = getAvailableDates(7);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState("morning");
  const [deliveryDate, setDeliveryDate] = useState(availableDates[0].iso);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Serviceability
  const [serviceability, setServiceability] = useState(null); // { serviceable, message }
  const [checkingServiceability, setCheckingServiceability] = useState(false);

  useEffect(() => {
    fetchAddresses();
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
      Alert.alert("Error", "Could not load addresses");
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
      // Don't block checkout if serviceability check fails
      setServiceability({ serviceable: true, message: "Could not verify serviceability" });
    } finally {
      setCheckingServiceability(false);
    }
  }, []);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    checkServiceabilityForAddress(addr);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert("Required", "Please select a delivery address");
      return;
    }
    if (serviceability && !serviceability.serviceable) {
      Alert.alert("Not Serviceable", "Please select an address within our delivery area");
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty");
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        shippingAddressId: selectedAddressId,
        deliverySlot,
        deliveryDate,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      const res = await customerAPI.createOrder(payload);
      const order = res.data.data;

      await clearCart();

      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      const addressLine = selectedAddr
        ? `${selectedAddr.address_line_1}, ${selectedAddr.city}`
        : "";

      router.replace({
        pathname: "/checkout/success",
        params: {
          orderId: order?.id || "",
          deliveryDate,
          addressLine,
        },
      });
    } catch (e) {
      console.error("Place order failed", e);
      const msg = e.response?.data?.message || "Failed to place order";
      Alert.alert("Order Failed", msg);
    } finally {
      setPlacingOrder(false);
    }
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
      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row items-center shadow-sm">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Address Section */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Delivery Address
        </Text>
        {addresses.length === 0 ? (
          <View className="bg-white p-6 rounded-xl items-center mb-6">
            <Text className="text-gray-500 mb-4">No addresses found</Text>
            <Pressable
              className="bg-green-600 px-6 py-3 rounded-lg"
              onPress={() => router.push("/address/add")}
            >
              <Text className="text-white font-medium">Add New Address</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mb-4">
            {addresses.map((addr) => (
              <Pressable
                key={addr.id}
                onPress={() => handleSelectAddress(addr)}
                className="p-4 rounded-xl mb-3 border"
                style={{
                  backgroundColor: selectedAddressId === addr.id ? "#f0fdf4" : "white",
                  borderColor: selectedAddressId === addr.id ? "#16a34a" : "#e5e7eb",
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">
                      {addr.address_type}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {addr.address_line_1}, {addr.city}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {addr.zip_code}
                    </Text>
                  </View>
                  {selectedAddressId === addr.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Serviceability Status */}
        {selectedAddressId && (
          <View className="mb-6">
            {checkingServiceability ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#16a34a" />
                <Text className="text-gray-500 ml-2 text-sm">Checking delivery availability...</Text>
              </View>
            ) : serviceability ? (
              <View className="flex-row items-center">
                <Ionicons
                  name={serviceability.serviceable ? "checkmark-circle" : "alert-circle"}
                  size={18}
                  color={serviceability.serviceable ? "#16a34a" : "#EF4444"}
                />
                <Text
                  className="ml-2 text-sm font-medium"
                  style={{ color: serviceability.serviceable ? "#16a34a" : "#ef4444" }}
                >
                  {serviceability.message}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Delivery Date */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Delivery Date
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {availableDates.map((d) => (
            <Pressable
              key={d.iso}
              onPress={() => setDeliveryDate(d.iso)}
              className="mr-3 px-4 py-3 rounded-xl border items-center min-w-[70px]"
              style={{
                backgroundColor: deliveryDate === d.iso ? "#16a34a" : "white",
                borderColor: deliveryDate === d.iso ? "#16a34a" : "#e5e7eb",
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: deliveryDate === d.iso ? "#dcfce7" : "#9ca3af" }}
              >
                {d.label || d.day}
              </Text>
              <Text
                className="text-xl font-bold"
                style={{ color: deliveryDate === d.iso ? "white" : "#111827" }}
              >
                {d.dateNum}
              </Text>
              <Text
                className="text-xs"
                style={{ color: deliveryDate === d.iso ? "#dcfce7" : "#6b7280" }}
              >
                {d.month}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Delivery Slot */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Delivery Slot
        </Text>
        <View className="flex-row mb-6">
          <Pressable
            onPress={() => setDeliverySlot("morning")}
            className="flex-1 p-4 rounded-xl mr-2 border items-center"
            style={{
              backgroundColor: deliverySlot === "morning" ? "#16a34a" : "white",
              borderColor: deliverySlot === "morning" ? "#16a34a" : "#e5e7eb",
            }}
          >
            <Ionicons
              name="sunny"
              size={24}
              color={deliverySlot === "morning" ? "white" : "gray"}
            />
            <Text
              className="mt-2 font-bold"
              style={{ color: deliverySlot === "morning" ? "white" : "#4b5563" }}
            >
              Morning
            </Text>
            <Text
              className="text-xs"
              style={{ color: deliverySlot === "morning" ? "#dcfce7" : "#9ca3af" }}
            >
              6 AM - 9 AM
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setDeliverySlot("evening")}
            className="flex-1 p-4 rounded-xl ml-2 border items-center"
            style={{
              backgroundColor: deliverySlot === "evening" ? "#16a34a" : "white",
              borderColor: deliverySlot === "evening" ? "#16a34a" : "#e5e7eb",
            }}
          >
            <Ionicons
              name="moon"
              size={24}
              color={deliverySlot === "evening" ? "white" : "gray"}
            />
            <Text
              className="mt-2 font-bold"
              style={{ color: deliverySlot === "evening" ? "white" : "#4b5563" }}
            >
              Evening
            </Text>
            <Text
              className="text-xs"
              style={{ color: deliverySlot === "evening" ? "#dcfce7" : "#9ca3af" }}
            >
              5 PM - 8 PM
            </Text>
          </Pressable>
        </View>

        {/* Delivery Notes */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Delivery Instructions
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="E.g., Leave at the door, ring the bell..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-gray-900"
          style={{ textAlignVertical: "top", minHeight: 80 }}
        />

        {/* Payment Method */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Payment Method
        </Text>
        <View className="bg-white p-4 rounded-xl mb-6 border border-gray-200">
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={24} color="#16a34a" />
            <Text className="ml-3 font-bold text-gray-900">
              Cash on Delivery (COD)
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#16a34a"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </View>

        {/* Order Summary */}
        <Text className="text-lg font-bold text-gray-900 mb-3">Summary</Text>
        <View className="bg-white p-4 rounded-xl mb-8 border border-gray-200">
          {/* Item breakdown */}
          {cartItems.map((item) => (
            <View key={item.variant.id} className="flex-row justify-between mb-2">
              <Text className="text-gray-600 flex-1" numberOfLines={1}>
                {item.variant.product?.name || "Item"} × {item.quantity}
              </Text>
              <Text className="font-medium text-gray-900 ml-2">
                ₹{(item.variant.price * item.quantity).toFixed(2)}
              </Text>
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
            <Text className="font-bold text-lg text-green-600">
              ₹{cartTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View className="p-4 bg-white border-t border-gray-100">
        <Pressable
          onPress={handlePlaceOrder}
          disabled={placingOrder || !canPlaceOrder}
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: placingOrder || !canPlaceOrder ? "#9ca3af" : "#16a34a" }}
        >
          {placingOrder ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-xl">Place Order</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
