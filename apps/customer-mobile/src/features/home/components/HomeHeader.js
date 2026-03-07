import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";

export default function HomeHeader({ onLocationPress }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { selectedLocation, user } = useAuth();
  
  // Format the display address
  let displayAddress = "Select Location";
  if (selectedLocation) {
    const type = selectedLocation.type || "Location";
    const line1 = selectedLocation.address_line1 || "";
    
    if (line1) {
      displayAddress = `${type} - ${line1.substring(0, 15)}${line1.length > 15 ? "..." : ""}`;
    } else if (selectedLocation.city) {
      displayAddress = `${type} - ${selectedLocation.city}`;
    } else if (selectedLocation.label) {
      displayAddress = selectedLocation.label;
    }
  }

  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <View className="bg-primary/10 p-2.5 rounded-full mr-3 border border-primary/20">
          <Ionicons name="location" size={24} color="#16a34a" />
        </View>
        <View className="justify-center">
          <Text className="text-xl font-black text-gray-900 tracking-tight leading-6">
            Devnagri <Text className="text-green-600">Farms</Text>
          </Text>
          <TouchableOpacity 
            className="flex-row items-center mt-0.5"
            onPress={onLocationPress || (() => router.push("/location/check"))}
          >
            <Text className="text-xs text-gray-500 font-medium mr-1">
              Delivering to <Text className="font-bold text-gray-800">{displayAddress}</Text>
            </Text>
            <Ionicons name="chevron-down" size={14} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity 
          onPress={() => router.push("/products")}
          className="p-1"
        >
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push("/wallet")}
          className="flex-row items-center bg-orange-50 px-2 py-1.5 rounded-xl border border-orange-100"
        >
          <Ionicons name="wallet-outline" size={18} color="#ea580c" />
          <Text className="ml-1.5 text-xs font-black text-orange-700">
            ₹{parseFloat(user?.wallet_balance || 0).toFixed(0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/account")}
          className="w-9 h-9 rounded-full bg-green-100 items-center justify-center border border-green-200"
        >
          <Ionicons name="person" size={20} color="#16a34a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
