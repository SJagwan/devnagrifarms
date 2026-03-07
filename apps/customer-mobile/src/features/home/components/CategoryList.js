import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CategoryList({
  categories,
  onSeeAllPress,
  onCategoryPress,
}) {
  return (
    <View className="px-4 mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-extrabold text-gray-900">Categories</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text className="text-primary text-sm font-bold">See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            className="items-center mr-6"
            style={{ opacity: 0.9 }}
            onPress={() => onCategoryPress?.(cat.id)}
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
  );
}
