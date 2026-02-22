import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

function formatDeliveryDate(isoDate) {
  if (!isoDate) return "Soon";
  const date = new Date(isoDate + "T00:00:00");
  const options = { weekday: "long", day: "numeric", month: "short" };
  return date.toLocaleDateString("en-IN", options);
}

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId, deliveryDate, addressLine } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark" size={48} color="#16a34a" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          Order Placed!
        </Text>
        <Text className="text-gray-500 text-center leading-6">
          Your order has been placed successfully. We will deliver your fresh
          produce right to your doorstep.
        </Text>
      </View>

      {/* Order Details */}
      <View className="w-full bg-gray-50 rounded-xl p-4 mb-8">
        {orderId ? (
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">Order ID</Text>
            <Text className="font-medium text-gray-900" numberOfLines={1}>
              #{orderId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        ) : null}

        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-500">Delivery Date</Text>
          <Text className="font-medium text-gray-900">
            {formatDeliveryDate(deliveryDate)}
          </Text>
        </View>

        {addressLine ? (
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Deliver To</Text>
            <Text
              className="font-medium text-gray-900 flex-1 text-right ml-4"
              numberOfLines={1}
            >
              {addressLine}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="w-full gap-y-4">
        <TouchableOpacity
          onPress={() => router.replace(`/orders/${orderId}`)}
          className="w-full bg-green-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">View Order Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="w-full border border-green-600 py-4 rounded-xl items-center"
        >
          <Text className="text-green-600 font-bold text-lg">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
