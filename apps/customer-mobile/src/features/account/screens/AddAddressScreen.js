import React, { useState, useEffect } from "react";
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
import { useAuth } from "@context/AuthContext";

export default function AddAddressScreen() {
  const router = useRouter();
  const { selectedLocation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address_type: "Home",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: null,
    longitude: null,
    is_default: false,
  });

  // Populate form when map selection changes
  useEffect(() => {
    if (selectedLocation) {
      setForm((prev) => ({
        ...prev,
        latitude: selectedLocation.lat || prev.latitude,
        longitude: selectedLocation.lng || prev.longitude,
        city: selectedLocation.city || "",
        state: selectedLocation.state || "",
        zip_code: selectedLocation.pincode || "",
        address_line_2: selectedLocation.addressLine || "",
      }));
    }
  }, [selectedLocation]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.address_line_1 || !form.city || !form.state || !form.zip_code) {
      Alert.alert("Error", "Please fill required fields (Address Line 1, City, State, Zip)");
      return;
    }

    if (!form.latitude || !form.longitude) {
      Alert.alert("Location Required", "Please select a location on the map.");
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
              className="mr-3 px-4 py-2 rounded-full border"
              style={{
                backgroundColor: form.address_type === type ? "#16a34a" : "white",
                borderColor: form.address_type === type ? "#16a34a" : "#d1d5db",
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: form.address_type === type ? "white" : "#374151" }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location (Map Pin Data) */}
        <View className="bg-green-50 rounded-xl mb-6 p-4 border border-green-200 shadow-sm flex-row items-center">
          <Ionicons name="map" size={32} color="#16a34a" />
          <View className="flex-1 ml-3 pr-2">
            <Text className="text-gray-800 font-bold text-sm mb-1">
              Delivery Location
            </Text>
            <Text className="text-gray-600 text-xs leading-4" numberOfLines={2}>
              {selectedLocation?.addressLine || "No precise location selected. Tap to drop a pin."}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white px-3 py-2 rounded-lg border border-gray-300"
            onPress={() => router.push("/location/map?returnTo=/account/addresses/add")}
          >
            <Text className="text-xs font-bold text-green-700">Change Map Pin</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Address Line 1 (House/Flat No) *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
            placeholder="e.g. Flat 4B, XYZ Apartments"
            value={form.address_line_1}
            onChangeText={(t) => handleChange("address_line_1", t)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Address Line 2 (Area/Landmark)</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
            placeholder="Sector 62, Near Metro Station"
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
            <Text className="text-gray-700 font-medium mb-1">State *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900"
              placeholder="State"
              value={form.state}
              onChangeText={(t) => handleChange("state", t)}
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
            className="w-6 h-6 rounded border items-center justify-center mr-3"
            style={{
              backgroundColor: form.is_default ? "#16a34a" : "white",
              borderColor: form.is_default ? "#16a34a" : "#9ca3af",
            }}
          >
            {form.is_default && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text className="text-gray-900 font-medium">Set as default address</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="py-4 rounded-xl items-center shadow-md mb-10"
          style={{ backgroundColor: loading ? "#9ca3af" : "#16a34a" }}
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
