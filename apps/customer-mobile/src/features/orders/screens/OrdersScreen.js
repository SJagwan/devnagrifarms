import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { customerAPI } from "@lib/api/customer.api";
import { Ionicons } from "@expo/vector-icons";

const STATUS_COLORS = {
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  confirmed: "text-blue-600 bg-blue-50 border-blue-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, []),
  );

  const fetchOrders = async () => {
    try {
      const res = await customerAPI.getOrders();
      setOrders(res.data.data.items);
    } catch (e) {
      console.error("Failed to load orders", e);
      Alert.alert("Error", "Could not load order history");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle =
      STATUS_COLORS[item.status] || "text-gray-600 bg-gray-50 border-gray-200";

    return (
      <Pressable
        onPress={() => router.push(`/orders/${item.id}`)}
        className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="font-bold text-gray-900 text-lg">
              #{item.id.split("-")[0].toUpperCase()}
            </Text>
            <Text className="text-gray-500 text-sm">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full border ${statusStyle.split(" ").slice(1).join(" ")}`}
          >
            <Text
              className={`text-xs font-bold capitalize ${statusStyle.split(" ")[0]}`}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-50">
          <Text className="text-gray-600 font-medium">Total Amount</Text>
          <Text className="text-green-700 font-bold text-lg">
            ₹{item.total_price}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-lg">No orders found</Text>
          <Pressable
            onPress={() => router.push("/(tabs)")}
            className="mt-6 bg-green-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold">Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
