import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Text,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import HomeHeader from "@features/home/components/HomeHeader";
import PromoCarousel from "@features/home/components/PromoCarousel";
import CategoryList from "@features/home/components/CategoryList";
import FeaturedProducts from "@features/home/components/FeaturedProducts";
import LocationSelectorSheet from "@features/home/components/LocationSelectorSheet";

import { useCart } from "../../../context/CartContext";
import { customerAPI } from "../../../lib/api";

export default function HomeScreen() {
  const router = useRouter();
  const { cartItems, addToCart, removeFromCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [categoriesRes, productsRes] = await Promise.all([
        customerAPI.getCategories(),
        customerAPI.getProducts({ limit: 10 }), // Fetch some featured products
      ]);

      setCategories(categoriesRes.data.data || []);

      // If needed, map product items to match ProductCard expectations if the backend changes
      const fetchedProducts = productsRes.data.data || [];
      const mappedProducts = fetchedProducts.map((p) => {
        // Find default variant or first variant representing the product
        const defaultVariant =
          p.variants?.find((v) => v.is_default) || p.variants?.[0] || {};
        const image = p.images?.[0]?.url || "https://via.placeholder.com/400";

        // Attach product details to the variant so CartContext has full context
        const fullVariant = {
          ...defaultVariant,
          product: { name: p.name },
          images: p.images && p.images.length > 0 ? p.images : [{ url: image }],
          product_id: p.id,
          quantity: defaultVariant.weight_value,
          unit: defaultVariant.weight_unit,
        };

        // If the ProductCard expects flat properties on variant/product:
        return {
          id: defaultVariant.id, // Important: Cart tracks by Variant ID
          product_id: p.id,
          name: p.name,
          weight:
            defaultVariant.weight_value + " " + defaultVariant.weight_unit,
          price: defaultVariant.price,
          originalPrice: defaultVariant.original_price || defaultVariant.price,
          discount: 0, // Calculate discount if needed
          image: image,
          min_order_qty: defaultVariant.min_order_qty || 1,
          max_order_qty: defaultVariant.max_order_qty,
          variant: fullVariant, // Pass the entire variant to pass to the cart
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Error fetching home data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleAddToCart = (product) => {
    // The cart expects the entire variant object, not the mapped flat product
    if (product.variant) {
      addToCart(product.variant, 1);
    }
  };

  const handleRemoveFromCart = (productId) => {
    // Assuming removeFromCart takes the variantId
    removeFromCart(productId);
  };

  const handleCategoryPress = (categoryId) => {
    // Navigate to products filtered by category
    router.push({ pathname: "/products", params: { categoryId } });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <HomeHeader onLocationPress={() => setLocationSheetVisible(true)} />

      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#16a34a"]}
            tintColor="#16a34a"
          />
        }
      >
        <View className="mt-4" />
        <PromoCarousel
          onBannerPress={(item) => {
            if (item.link_type === "PRODUCT" && item.link_id) {
              router.push({
                pathname: "/products/[id]",
                params: { id: item.link_id },
              });
            } else if (item.link_type === "CATEGORY" && item.link_id) {
              router.push({
                pathname: "/products",
                params: { categoryId: item.link_id },
              });
            } else if (item.link_type === "EXTERNAL" && item.external_url) {
              Linking.openURL(item.external_url);
            } else {
              router.push("/products");
            }
          }}
        />

        {error && (
          <View className="mx-4 mb-4 p-3 bg-red-50 rounded-lg">
            <Text className="text-red-600 text-center text-sm">{error}</Text>
          </View>
        )}

        <CategoryList
          categories={categories}
          onCategoryPress={handleCategoryPress}
          onSeeAllPress={() => console.log("See all categories")}
        />

        <FeaturedProducts
          products={products}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
        />
      </ScrollView>

      {/* Location Selector Bottom Sheet */}
      <LocationSelectorSheet 
        isVisible={locationSheetVisible} 
        onClose={() => setLocationSheetVisible(false)} 
      />
    </View>
  );
}
