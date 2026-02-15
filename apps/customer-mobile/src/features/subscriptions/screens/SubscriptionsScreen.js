import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { customerAPI } from "@lib/api/customer.api";
import { Ionicons } from "@expo/vector-icons";

export default function SubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, []),
  );

  const fetchSubscriptions = async () => {
    try {
      const res = await customerAPI.getSubscriptions();
      setSubscriptions(res.data.data);
    } catch (e) {
      console.error("Failed to load subscriptions", e);
      Alert.alert("Error", "Could not load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <Pressable
        onPress={() => router.push(`/account/subscriptions/${item.id}`)}
        className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-lg">
              {item.subscription_name}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Started {new Date(item.start_date).toLocaleDateString()}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              item.status === "active"
                ? "bg-green-50 border border-green-200"
                : item.status === "paused"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-red-50 border border-red-200"
            }`}
          >
            <Text
              className={`text-xs font-bold capitalize ${
                item.status === "active"
                  ? "text-green-600"
                  : item.status === "paused"
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-50">
          <View className="flex-row items-center">
            <Ionicons name="repeat-outline" size={16} color="#4B5563" />
            <Text className="text-gray-600 font-medium ml-1 capitalize">
              {item.schedule_type}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {subscriptions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-lg">
            No subscriptions found
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)")}
            className="mt-6 bg-green-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold">Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
