import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";

export default function SubscriptionSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { variantId, productName, unit, price } = params;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [frequency, setFrequency] = useState("daily");
  const [deliverySlot, setDeliverySlot] = useState("morning");
  const [startDate, setStartDate] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Generate next 7 days for selection
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return {
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      }),
      value: d.toISOString().split("T")[0],
    };
  });

  useEffect(() => {
    if (dates.length > 0) setStartDate(dates[0].value);
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await customerAPI.getAddresses();
      const addrList = res.data.data;
      setAddresses(addrList);
      const defaultAddr = addrList.find((a) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addrList.length > 0) setSelectedAddressId(addrList[0].id);
    } catch (e) {
      console.error("Failed to fetch addresses", e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAddressId) {
      Alert.alert("Required", "Please select a delivery address");
      return;
    }
    if (!startDate) {
      Alert.alert("Required", "Please select a start date");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: [{ variantId, quantity }],
        shippingAddressId: selectedAddressId,
        scheduleType: frequency,
        startDate,
        deliverySlot,
      };

      await customerAPI.createSubscription(payload);

      Alert.alert("Success", "Subscription created successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (e) {
      console.error("Subscription failed", e);
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to create subscription",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      <View className="bg-white px-4 py-4 flex-row items-center shadow-sm z-10">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">
          Setup Subscription
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Product Summary */}
        <View className="bg-white p-4 rounded-xl mb-6 flex-row items-center border border-gray-100">
          <View className="w-12 h-12 bg-green-100 rounded-lg items-center justify-center mr-4">
            <Ionicons name="nutrition" size={24} color="#16a34a" />
          </View>
          <View>
            <Text className="font-bold text-gray-900 text-lg">
              {productName}
            </Text>
            <Text className="text-gray-500">
              {quantity} x {unit} • ₹{price}/{unit}
            </Text>
          </View>
        </View>

        {/* Frequency */}
        <Text className="text-lg font-bold text-gray-900 mb-3">Frequency</Text>
        <View className="flex-row mb-6 bg-white p-1 rounded-xl border border-gray-200">
          {["daily", "alternate", "weekly"].map((freq) => (
            <Pressable
              key={freq}
              onPress={() => setFrequency(freq)}
              className="flex-1 py-3 rounded-lg items-center"
              style={{
                backgroundColor: frequency === freq ? "#16a34a" : "transparent",
              }}
            >
              <Text
                className="font-semibold capitalize"
                style={{ color: frequency === freq ? "white" : "#4b5563" }}
              >
                {freq}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Start Date */}
        <Text className="text-lg font-bold text-gray-900 mb-3">Start Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {dates.map((date) => (
            <Pressable
              key={date.value}
              onPress={() => setStartDate(date.value)}
              className="mr-3 px-4 py-3 rounded-xl border items-center min-w-[80px]"
              style={{
                backgroundColor: startDate === date.value ? "#16a34a" : "white",
                borderColor: startDate === date.value ? "#16a34a" : "#e5e7eb",
              }}
            >
              <Text
                className="text-xs mb-1"
                style={{ color: startDate === date.value ? "#dcfce7" : "#6b7280" }}
              >
                {date.value.split("-")[1]}/{date.value.split("-")[2]}
              </Text>
              <Text
                className="font-bold"
                style={{ color: startDate === date.value ? "white" : "#111827" }}
              >
                {date.label.split(" ")[0]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Delivery Slot */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Delivery Slot
        </Text>
        <View className="flex-row mb-6">
          {["morning", "evening"].map((slot) => (
            <Pressable
              key={slot}
              onPress={() => setDeliverySlot(slot)}
              className="flex-1 p-4 rounded-xl border items-center mr-2"
              style={{
                backgroundColor: deliverySlot === slot ? "#16a34a" : "white",
                borderColor: deliverySlot === slot ? "#16a34a" : "#e5e7eb",
              }}
            >
              <Ionicons
                name={slot === "morning" ? "sunny" : "moon"}
                size={24}
                color={deliverySlot === slot ? "white" : "gray"}
              />
              <Text
                className="mt-2 font-bold capitalize"
                style={{ color: deliverySlot === slot ? "white" : "#4b5563" }}
              >
                {slot}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Address */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Delivery Address
        </Text>
        {addresses.length === 0 ? (
          <View className="bg-white p-4 rounded-xl border border-gray-200">
            <Text className="text-gray-500">No addresses found.</Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <Pressable
              key={addr.id}
              onPress={() => setSelectedAddressId(addr.id)}
              className="p-4 rounded-xl mb-3 border"
              style={{
                backgroundColor: selectedAddressId === addr.id ? "#f0fdf4" : "white",
                borderColor: selectedAddressId === addr.id ? "#16a34a" : "#e5e7eb",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-bold text-gray-900">
                    {addr.address_type}
                  </Text>
                  <Text className="text-gray-600 text-xs mt-1">
                    {addr.address_line_1}, {addr.city}
                  </Text>
                </View>
                {selectedAddressId === addr.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <View className="p-4 bg-white border-t border-gray-100">
        <Pressable
          onPress={handleConfirm}
          disabled={submitting}
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: submitting ? "#9ca3af" : "#16a34a" }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-xl">
              Confirm Subscription
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
