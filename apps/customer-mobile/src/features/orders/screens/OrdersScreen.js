import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect, Stack } from "expo-router";
import { customerAPI } from "@lib/api/customer.api";
import { Ionicons } from "@expo/vector-icons";

const STATUS_COLORS = {
  pending: {
    text: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  confirmed: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  shipped: {
    text: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  delivered: {
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  cancelled: {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else if (orders.length === 0) setLoading(true);

    try {
      const res = await customerAPI.getOrders();
      // Safe extraction of orders data
      const orderList = res.data?.data?.items || res.data?.items || res.data || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (e) {
      console.error("Failed to load orders", e);
      Alert.alert("Error", "Could not load order history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orders.length]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const onRefresh = () => {
    fetchOrders(true);
  };

  const renderItem = ({ item }) => {
    const status = (item.status || "pending").toLowerCase();
    const colors = STATUS_COLORS[status] || {
      text: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
    };

    const formattedDate = item.created_at 
      ? new Date(item.created_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const orderId = typeof item.id === 'string' 
      ? item.id.split("-")[0].toUpperCase() 
      : String(item.id);

    return (
      <Pressable
        onPress={() => router.push(`/orders/${item.id}`)}
        className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm overflow-hidden"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-gray-900 text-lg">
                Order #{orderId}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs">
              Placed on {formattedDate}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full border ${colors.bg} ${colors.border}`}
          >
            <Text
              className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}
            >
              {status}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-50">
          <View className="flex-row items-center">
            <Ionicons name="cart-outline" size={16} color="#4B5563" />
            <Text className="text-gray-600 font-medium ml-1 text-sm">Amount Paid</Text>
          </View>
          <Text className="text-green-700 font-bold text-lg">
            ₹{item.total_price}
          </Text>
        </View>
        
        <View className="mt-2 flex-row items-center">
          <Text className="text-gray-400 text-[10px]">
            {item.items_count || 0} items • {item.payment_method || 'COD'}
          </Text>
          <View className="flex-1" />
          <Text className="text-green-600 text-[11px] font-medium">View Details →</Text>
        </View>
      </Pressable>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerTitle: "Order History", headerShadowVisible: false }} />
      
      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm border border-gray-100">
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-bold text-xl">No orders yet</Text>
          <Text className="text-gray-500 mt-2 text-center px-4 leading-5">
            Looks like you haven't placed any orders. Start exploring our fresh
            farm products!
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)")}
            className="mt-10 bg-green-600 px-10 py-4 rounded-2xl shadow-md active:bg-green-700"
          >
            <Text className="text-white font-bold text-lg">Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#16a34a"]}
              tintColor="#16a34a"
            />
          }
        />
      )}
    </View>
  );
}
