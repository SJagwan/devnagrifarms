import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPublicImageUrl } from "../../../lib/storage";

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
            <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center border border-gray-100 mb-2 shadow-sm overflow-hidden">
              {cat.image_url ? (
                <Image
                  source={{ uri: getPublicImageUrl(cat.image_url) }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="p-4 items-center justify-center">
                  <Ionicons name={cat.icon || "leaf"} size={32} color="#2E7D32" />
                </View>
              )}
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
