import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, []),
  );

  const fetchOrders = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else if (orders.length === 0) setLoading(true);

    try {
      const res = await customerAPI.getOrders();
      setOrders(res.data.data.items);
    } catch (e) {
      console.error("Failed to load orders", e);
      Alert.alert("Error", "Could not load order history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchOrders(true);
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
              {new Date(item.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
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

  if (loading && !refreshing) {
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
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-bold text-xl">No orders yet</Text>
          <Text className="text-gray-500 mt-2 text-center px-8">
            Looks like you haven't placed any orders. Start exploring our fresh
            farm products!
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)")}
            className="mt-8 bg-green-600 px-8 py-3 rounded-xl shadow-sm"
          >
            <Text className="text-white font-bold text-lg">Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
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
