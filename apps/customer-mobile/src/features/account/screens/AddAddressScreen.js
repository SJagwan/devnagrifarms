import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";

export default function AddAddressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address_type: "Home",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "Delhi",
    zip_code: "",
    latitude: 28.6139, // Default to New Delhi
    longitude: 77.2090,
    is_default: false,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.address_line_1 || !form.city || !form.zip_code) {
      Alert.alert("Error", "Please fill required fields (Address Line 1, City, Zip)");
      return;
    }

    setLoading(true);
    try {
      await customerAPI.addAddress(form);
      Alert.alert("Success", "Address added successfully!");
      router.back();
    } catch (e) {
      console.error("Add Address Failed", e);
      Alert.alert("Error", e.response?.data?.message || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
        {/* Address Type */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
          Address Type
        </Text>
        <View className="flex-row mb-6">
          {["Home", "Work", "Other"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleChange("address_type", type)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                form.address_type === type
                  ? "bg-green-600 border-green-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`font-semibold ${
                  form.address_type === type ? "text-white" : "text-gray-700"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location (Fake Map Placeholder) */}
        <View className="h-40 bg-gray-100 rounded-xl mb-6 items-center justify-center border border-gray-200">
          <Ionicons name="map-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 mt-2 font-medium">
            Location pinned: New Delhi (Demo)
          </Text>
          <TouchableOpacity
            className="mt-2 bg-white px-3 py-1 rounded-lg border border-gray-300 shadow-sm"
            onPress={() => Alert.alert("Demo", "Using default demo coordinates for MVP testing.")}
          >
            <Text className="text-xs font-bold text-gray-700">Change Location</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Address Line 1 *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
            placeholder="House No, Building, Street"
            value={form.address_line_1}
            onChangeText={(t) => handleChange("address_line_1", t)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Address Line 2</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
            placeholder="Landmark, Area (Optional)"
            value={form.address_line_2}
            onChangeText={(t) => handleChange("address_line_2", t)}
          />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-gray-700 font-medium mb-1">City *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
              placeholder="City"
              value={form.city}
              onChangeText={(t) => handleChange("city", t)}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 font-medium mb-1">State</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
              value={form.state}
              editable={false} // Hardcoded for demo/MVP focus
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-1">Zip Code *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
            placeholder="110001"
            keyboardType="numeric"
            value={form.zip_code}
            onChangeText={(t) => handleChange("zip_code", t)}
            maxLength={6}
          />
        </View>

        {/* Set Default Toggle */}
        <TouchableOpacity
          onPress={() => handleChange("is_default", !form.is_default)}
          className="flex-row items-center mb-8"
        >
          <View
            className={`w-6 h-6 rounded border items-center justify-center mr-3 ${
              form.is_default
                ? "bg-green-600 border-green-600"
                : "bg-white border-gray-400"
            }`}
          >
            {form.is_default && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text className="text-gray-900 font-medium">Set as default address</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`py-4 rounded-xl items-center shadow-md mb-10 ${
            loading ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Address</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
