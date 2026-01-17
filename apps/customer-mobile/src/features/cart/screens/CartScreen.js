import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CartScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-4 flex-row items-center shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Your Cart</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white p-8 rounded-2xl items-center justify-center border border-gray-100 border-dashed">
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text className="text-gray-400 mt-4 text-center">
            Your cart is empty.{"\n"}Start adding fresh produce!
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-primary px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold">Browse Products</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
