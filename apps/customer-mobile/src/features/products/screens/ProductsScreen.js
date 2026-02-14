import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        customerAPI.getProducts(),
        customerAPI.getCategories(),
      ]);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category_id === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const handleProductPress = (product) => {
    router.push(`/products/${product.id}`);
  };

  const renderProductCard = ({ item }) => (
    <Pressable
      onPress={() => handleProductPress(item)}
      className="flex-1 m-2 bg-white rounded-2xl overflow-hidden border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Product Image */}
      <View className="h-32 bg-gradient-to-br from-green-50 to-green-100 items-center justify-center">
        <Ionicons name="cube-outline" size={48} color="#16a34a" />
      </View>

      {/* Product Info */}
      <View className="p-3">
        <Text
          className="text-base font-bold text-gray-900 mb-1"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
          {item.category?.name || "Uncategorized"}
        </Text>

        {/* Variants count badge */}
        <View className="flex-row items-center justify-between">
          <View className="bg-green-50 px-2 py-1 rounded-full">
            <Text className="text-xs font-medium text-green-700">
              {item.variants?.length || 0} variants
            </Text>
          </View>
          <View className="bg-green-600 w-8 h-8 rounded-full items-center justify-center">
            <Ionicons name="chevron-forward" size={16} color="white" />
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderCategoryChip = (category) => {
    const isSelected = selectedCategory === category.id;
    return (
      <Pressable
        key={category.id}
        onPress={() => setSelectedCategory(isSelected ? null : category.id)}
        className="px-4 py-2 rounded-full mr-2 border"
        style={{
          backgroundColor: isSelected ? "#16a34a" : "white",
          borderColor: isSelected ? "#16a34a" : "#e5e7eb",
        }}
      >
        <Text
          className="text-sm font-medium"
          style={{ color: isSelected ? "white" : "#374151" }}
        >
          {category.name}
        </Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-500 mt-3 text-sm">Loading products...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Products</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Chips */}
      {categories.length > 0 && (
        <View className="py-3 bg-white border-b border-gray-100">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <Pressable
              onPress={() => setSelectedCategory(null)}
              className="px-4 py-2 rounded-full mr-2 border"
              style={{
                backgroundColor: selectedCategory === null ? "#16a34a" : "white",
                borderColor: selectedCategory === null ? "#16a34a" : "#e5e7eb",
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: selectedCategory === null ? "white" : "#374151" }}
              >
                All
              </Text>
            </Pressable>
            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-500 mt-4 text-center">
            No products found
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            Try a different search or category
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
