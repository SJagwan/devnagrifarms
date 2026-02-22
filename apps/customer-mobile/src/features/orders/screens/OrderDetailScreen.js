import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { customerAPI } from "@lib/api/customer.api";
import { Ionicons } from "@expo/vector-icons";

const STATUS_CONFIG = {
  pending: { icon: "time-outline", color: "#ca8a04", textColor: "text-yellow-600" },
  confirmed: { icon: "checkmark-circle-outline", color: "#2563eb", textColor: "text-blue-600" },
  shipped: { icon: "bicycle-outline", color: "#9333ea", textColor: "text-purple-600" },
  delivered: { icon: "home-outline", color: "#16a34a", textColor: "text-green-600" },
  cancelled: { icon: "close-circle-outline", color: "#dc2626", textColor: "text-red-600" },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await customerAPI.getOrderById(id);
      setOrder(res.data.data);
    } catch (e) {
      console.error("Failed to load order detail", e);
      Alert.alert("Error", "Could not load order details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchOrder(true);
  }, [id]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!order) return null;

  const { shipping_address_snapshot: address } = order;
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#16a34a"]}
          tintColor="#16a34a"
        />
      }
    >
      {/* Header Status */}
      <View className="bg-white p-6 mb-4 shadow-sm items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-2 bg-gray-50">
          <Ionicons
            name={statusInfo.icon}
            size={48}
            color={statusInfo.color}
          />
        </View>
        <Text
          className={`text-xl font-bold mt-2 capitalize ${statusInfo.textColor}`}
        >
          {order.status}
        </Text>
        <Text className="text-gray-500 mt-1">
          Order #{order.id.split("-")[0].toUpperCase()}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          Placed on {new Date(order.created_at).toLocaleString("en-IN")}
        </Text>
      </View>

      {/* Items */}
      <View className="bg-white p-4 mb-4 shadow-sm">
        <Text className="font-bold text-gray-900 text-lg mb-4">Items</Text>
        {order.items.map((item) => (
          <View
            key={item.id}
            className="flex-row justify-between mb-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0"
          >
            <View className="flex-1">
              <Text className="font-medium text-gray-900 text-base">
                {item.variant?.product?.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {item.quantity} x {item.variant?.unit} • ₹{item.price}
              </Text>
            </View>
            <Text className="font-bold text-gray-900">₹{item.total_price}</Text>
          </View>
        ))}

        <View className="border-t border-gray-100 pt-4 mt-2">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Subtotal</Text>
            <Text className="text-gray-900">₹{order.total_price}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Delivery Fee</Text>
            <Text className="text-green-600">Free</Text>
          </View>
          <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
            <Text className="font-bold text-lg text-gray-900">Total</Text>
            <Text className="font-bold text-lg text-green-600">
              ₹{order.total_price}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Details */}
      <View className="bg-white p-4 mb-8 shadow-sm">
        <Text className="font-bold text-gray-900 text-lg mb-4">
          Delivery Details
        </Text>

        <View className="flex-row mb-4">
          <View className="w-8">
            <Ionicons name="location-outline" size={20} color="#6B7280" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-700">
              Shipping Address
            </Text>
            {address ? (
              <Text className="text-gray-600 mt-1 leading-5">
                {address.address_line_1}
                {"\n"}
                {address.address_line_2 ? address.address_line_2 + "\n" : ""}
                {address.city}, {address.state} - {address.zip_code}
              </Text>
            ) : (
              <Text className="text-gray-500 italic">
                Address not available
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row">
          <View className="w-8">
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-700">Delivery Slot</Text>
            <Text className="text-gray-600 mt-1 capitalize">
              {order.delivery_slot} (
              {new Date(order.delivery_date).toLocaleDateString()})
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
