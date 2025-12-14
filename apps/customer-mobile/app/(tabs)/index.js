import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { authAPI } from "../../lib/api";
import api from "../../lib/api";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Assuming we added this endpoint
      const { data } = await api.get("/customer/categories");
      setCategories(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-100">
          <View>
            <Text className="text-gray-500 text-xs">Delivering to</Text>
            <Text className="text-gray-900 font-bold">Home</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View className="p-4">
          <View className="bg-green-100 rounded-xl p-6 items-center justify-center h-40">
            <Text className="text-green-800 font-bold text-xl">Fresh Milk</Text>
            <Text className="text-green-600">Straight from the farm</Text>
          </View>
        </View>

        {/* Categories */}
        <View className="px-4">
          <Text className="font-bold text-lg mb-3 text-gray-900">
            Shop by Category
          </Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <View className="flex-row flex-wrap gap-4">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className="w-[30%] items-center mb-4"
                >
                  <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-2 border border-gray-100">
                    <Ionicons name="pint-outline" size={30} color="#16a34a" />
                  </View>
                  <Text className="text-center text-xs font-medium text-gray-800">
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Popular */}
        <View className="px-4 mt-4 pb-8">
          <Text className="font-bold text-lg mb-3 text-gray-900">
            Popular Products
          </Text>
          {/* Horizontal Scroll Placeholder */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="w-40 mr-4 border border-gray-100 rounded-lg p-2"
              >
                <View className="h-24 bg-gray-100 rounded mb-2" />
                <Text className="font-medium text-gray-900">Cow Milk</Text>
                <Text className="text-green-600 font-bold">₹45 / 500ml</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
