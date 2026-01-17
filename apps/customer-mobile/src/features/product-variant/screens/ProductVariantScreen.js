import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";

export default function ProductVariantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [productRes, variantsRes] = await Promise.all([
        customerAPI.getProductById(id),
        customerAPI.getProductVariants(id),
      ]);
      setProduct(productRes.data.data);
      setVariants(variantsRes.data.data || []);
    } catch (e) {
      console.error("Failed to fetch product:", e);
      Alert.alert("Error", "Failed to load product details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlan = (variant) => {
    // TODO: Add to subscription plan context
    Alert.alert(
      "Coming Soon",
      `Add ${product.name} (${variant.quantity}${variant.unit}) to your plan`,
    );
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(0)}`;
  };

  const getDiscountPercent = (variant) => {
    if (variant.discount_percent && variant.discount_percent > 0) {
      return Math.round(variant.discount_percent);
    }
    if (variant.mrp && variant.price && variant.mrp > variant.price) {
      return Math.round(((variant.mrp - variant.price) / variant.mrp) * 100);
    }
    return 0;
  };

  const renderVariantCard = (variant) => {
    const discount = getDiscountPercent(variant);

    return (
      <View
        key={variant.id}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Header Row */}
        <View className="flex-row items-start justify-between mb-3">
          {/* Variant Info */}
          <View className="flex-1">
            {/* Type & Source badges */}
            <View className="flex-row flex-wrap mb-2">
              {variant.type && (
                <View className="bg-blue-50 px-2 py-1 rounded-full mr-2 mb-1">
                  <Text className="text-xs font-semibold text-blue-700">
                    {variant.type}
                  </Text>
                </View>
              )}
              {variant.source && (
                <View className="bg-amber-50 px-2 py-1 rounded-full mr-2 mb-1">
                  <Text className="text-xs font-semibold text-amber-700">
                    {variant.source}
                  </Text>
                </View>
              )}
              {variant.bottle_option && (
                <View className="bg-purple-50 px-2 py-1 rounded-full mb-1">
                  <Text className="text-xs font-semibold text-purple-700">
                    {variant.bottle_option}
                  </Text>
                </View>
              )}
            </View>

            {/* Size */}
            <Text className="text-lg font-bold text-gray-900">
              {variant.quantity} {variant.unit}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              SKU: {variant.sku}
            </Text>
          </View>

          {/* Discount Badge */}
          {discount > 0 && (
            <View className="bg-green-500 px-2 py-1 rounded-lg">
              <Text className="text-xs font-bold text-white">
                {discount}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Price Row */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View className="flex-row items-baseline">
            <Text className="text-xl font-bold text-green-600">
              {formatPrice(variant.price)}
            </Text>
            {variant.mrp &&
              parseFloat(variant.mrp) > parseFloat(variant.price) && (
                <Text className="text-sm text-gray-400 line-through ml-2">
                  {formatPrice(variant.mrp)}
                </Text>
              )}
          </View>

          {/* Add to Plan Button */}
          <TouchableOpacity
            onPress={() => handleAddToPlan(variant)}
            className="bg-green-600 flex-row items-center px-4 py-2.5 rounded-xl"
            style={{
              shadowColor: "#16a34a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-semibold ml-1">Add to Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Order Limits */}
        {(variant.min_order_qty > 1 || variant.max_order_qty) && (
          <View className="flex-row mt-2 pt-2 border-t border-gray-100">
            <Text className="text-xs text-gray-400">
              Min: {variant.min_order_qty || 1}
              {variant.max_order_qty && ` • Max: ${variant.max_order_qty}`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-500 mt-3 text-sm">Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 mt-3">Product not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Custom Header */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: product.name,
          headerTitleStyle: { fontWeight: "600", color: "#111827" },
          headerStyle: { backgroundColor: "white" },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Product Hero */}
        <View className="h-56 bg-gradient-to-br from-green-100 to-green-200 items-center justify-center">
          <Ionicons name="nutrition" size={80} color="#16a34a" />
        </View>

        {/* Product Info */}
        <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-100">
          {/* Category badge */}
          <View className="bg-green-50 self-start px-3 py-1 rounded-full mb-2">
            <Text className="text-xs font-semibold text-green-700">
              {product.category?.name || "Uncategorized"}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-gray-900">
            {product.name}
          </Text>

          {product.description && (
            <Text className="text-gray-600 mt-2 leading-5">
              {product.description}
            </Text>
          )}

          {/* Tax info */}
          {product.default_tax > 0 && (
            <Text className="text-xs text-gray-400 mt-2">
              Includes {product.default_tax}% GST
            </Text>
          )}
        </View>

        {/* Variants Section */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Choose a variant ({variants.length})
          </Text>

          {variants.length > 0 ? (
            variants.map(renderVariantCard)
          ) : (
            <View className="bg-white rounded-2xl p-6 items-center border border-gray-100">
              <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-3 text-center">
                No variants available for this product
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
