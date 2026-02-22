import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      const res = await customerAPI.getAddresses();
      setAddresses(res.data.data);
    } catch (e) {
      console.error("Failed to fetch addresses", e);
      Alert.alert("Error", "Could not load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    router.push("/account/add-address");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {addresses.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="location-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-lg font-medium">
              No addresses saved
            </Text>
            <Text className="text-gray-400 mt-1 text-center px-8">
              Add your home or work address for faster checkout.
            </Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <View
              key={addr.id}
              className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                  <View className="bg-gray-100 p-2 rounded-lg mr-3">
                    <Ionicons
                      name={
                        addr.address_type.toLowerCase() === "home"
                          ? "home"
                          : addr.address_type.toLowerCase() === "work"
                          ? "briefcase"
                          : "location"
                      }
                      size={20}
                      color="#4B5563"
                    />
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900 capitalize">
                      {addr.address_type}
                    </Text>
                    {addr.is_default && (
                      <Text className="text-xs text-green-600 font-medium">
                        Default
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-gray-600 mt-1 leading-5">
                {addr.address_line_1}
                {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}
              </Text>
              <Text className="text-gray-600">
                {addr.city}, {addr.state} - {addr.zip_code}
              </Text>
            </View>
          ))
        )}
        {/* Spacer for FAB */}
        <View className="h-20" />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={handleAddAddress}
        className="absolute bottom-6 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
