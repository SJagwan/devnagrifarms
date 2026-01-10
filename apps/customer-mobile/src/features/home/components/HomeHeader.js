import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeHeader({ cartCount = 0 }) {
  const router = useRouter();

  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <View className="bg-primary/10 p-2 rounded-full mr-3">
          <Ionicons name="location" size={20} color="#2E7D32" />
        </View>
        <View>
          <Text className="text-xs text-gray-500 font-medium">
            Delivering to
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-gray-900 font-bold text-sm mr-1">
              Home - Green Park
            </Text>
            <Ionicons name="chevron-down" size={14} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center space-x-4">
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/cart")}>
          <View className="relative">
            <Ionicons name="cart-outline" size={24} color="#333" />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 justify-center items-center border border-white">
                <Text className="text-white text-[9px] font-bold">
                  {cartCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
