import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import HomeHeader from "@features/home/components/HomeHeader";
import ProductCard from "@features/product/components/ProductCard";

// Mock Data
const CATEGORIES = [
  { id: 1, name: "Vegetables", icon: "nutrition" },
  { id: 2, name: "Fruits", icon: "leaf" },
  { id: 3, name: "Dairy", icon: "water" },
  { id: 4, name: "Herbs", icon: "flower" },
  { id: 5, name: "Dry Fruits", icon: "nutrition" },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Fresh Organic Tomato",
    weight: "500g",
    price: 40,
    originalPrice: 50,
    discount: 20,
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Green Spinach (Palak)",
    weight: "250g",
    price: 30,
    image:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Farm Fresh Carrot",
    weight: "500g",
    price: 45,
    originalPrice: 60,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Cauliflower",
    weight: "1 pc",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1568584711075-3d021a7c3d54?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Red Onion",
    weight: "1 kg",
    price: 60,
    originalPrice: 80,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    name: "Potatoes",
    weight: "1 kg",
    price: 25,
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80",
  },
];

export default function HomeScreen() {
  const [cartItems, setCartItems] = useState({});

  const addToCart = (id) => {
    setCartItems((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const newCount = (prev[id] || 0) - 1;
      if (newCount <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newCount };
    });
  };

  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <HomeHeader cartCount={cartCount} />

      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="px-4 py-4 bg-white sticky top-0 z-10 shadow-sm">
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
            <Ionicons name="search" size={22} color="#9CA3AF" />
            <TextInput
              placeholder="Search for fresh goodness..."
              className="flex-1 ml-3 text-base text-gray-900 font-medium"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Banner */}
        <View className="px-4 mb-8 mt-2">
          <View className="w-full h-40 rounded-3xl p-5 justify-between bg-green-100">
            <View>
              <View className="bg-white/30 self-start px-2 py-1 rounded-full mb-2">
                <Text className="text-green-900 text-[10px] font-bold uppercase">
                  New Arrival
                </Text>
              </View>
              <Text className="text-green-900 font-extrabold text-2xl leading-7">
                Fresh from Farm
              </Text>
              <Text className="text-green-800 text-sm mt-1 font-medium">
                Get 20% off on your first order
              </Text>
            </View>
            <TouchableOpacity className="bg-white self-start px-5 py-2.5 rounded-xl shadow-sm">
              <Text className="text-green-800 font-bold text-xs">
                ORDER NOW
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View className="px-4 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-extrabold text-gray-900">
              Categories
            </Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-bold">See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center mr-6"
                style={{ opacity: 0.9 }}
              >
                <View className="w-18 h-18 bg-white rounded-2xl items-center justify-center border border-gray-100 mb-2 shadow-sm p-4">
                  <Ionicons name={cat.icon} size={32} color="#2E7D32" />
                </View>
                <Text className="text-xs text-gray-600 font-semibold tracking-wide">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View className="px-4 pb-24">
          <Text className="text-xl font-extrabold text-gray-900 mb-5">
            Featured Products
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {PRODUCTS.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                quantity={cartItems[product.id] || 0}
                onAdd={() => addToCart(product.id)}
                onRemove={() => removeFromCart(product.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
