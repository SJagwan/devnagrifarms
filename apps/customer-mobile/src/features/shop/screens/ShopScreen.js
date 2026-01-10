import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import api from "@lib/apiClient";
import { Ionicons } from "@expo/vector-icons";

export default function ShopScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/customer/products");
      setProducts(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity className="flex-1 m-2 bg-white rounded-lg shadow-sm border border-gray-100 p-2">
      <View className="h-32 bg-gray-100 rounded mb-2 w-full" />
      <Text className="font-medium text-gray-900 line-clamp-1">
        {item.name}
      </Text>
      <Text className="text-xs text-gray-500 mb-2">{item.category?.name}</Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-green-600 font-bold">View</Text>
        <Ionicons name="add-circle" size={24} color="#16a34a" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-xl font-bold">All Products</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center">
          <ActivityIndicator color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
        />
      )}
    </View>
  );
}
