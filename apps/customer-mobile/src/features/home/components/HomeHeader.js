import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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

      <View className="flex-row items-center gap-4">
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/account")}
          className="w-9 h-9 rounded-full bg-green-100 items-center justify-center"
        >
          <Ionicons name="person" size={20} color="#16a34a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
