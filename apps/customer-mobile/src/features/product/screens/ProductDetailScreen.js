import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import api from "@lib/apiClient";
import Button from "@shared/components/Button";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/customer/products/${id}`);
      setProduct(data.data);
    } catch (e) {
      Alert.alert("Error", "Failed to load product");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center">
        <ActivityIndicator color="#16a34a" />
      </View>
    );
  if (!product) return null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="h-64 bg-gray-100 w-full mb-4" />

        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </Text>
          <Text className="text-gray-500 mb-4">{product.description}</Text>

          <View className="bg-green-50 p-4 rounded-lg mb-6">
            <Text className="text-green-800 font-semibold mb-2">
              Available Variants
            </Text>
            {product.variants?.map((v) => (
              <View
                key={v.id}
                className="flex-row justify-between items-center py-2 border-b border-green-100 last:border-0"
              >
                <Text className="font-medium text-gray-800">
                  {v.quantity} {v.unit}
                </Text>
                <Text className="font-bold text-green-700">₹{v.price}</Text>
              </View>
            ))}
          </View>

          <Text className="text-sm text-gray-400">
            Category: {product.category?.name}
          </Text>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-100 bg-white shadow-lg">
        <Button
          title="Subscribe Now"
          onPress={() =>
            Alert.alert("Coming Soon", "Subscription flow to be implemented")
          }
        />
      </View>
    </SafeAreaView>
  );
}
