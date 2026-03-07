import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";
import { useAuth } from "@context/AuthContext";

const ADDRESS_TYPES = [
  { key: "Home", icon: "home", label: "Home" },
  { key: "Work", icon: "briefcase", label: "Work" },
  { key: "Other", icon: "location", label: "Other" },
];

export default function AddAddressScreen() {
  const router = useRouter();
  const { id: editId } = useLocalSearchParams();
  const isEditMode = !!editId;

  const { selectedLocation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
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

  useEffect(() => {
    if (isEditMode) fetchAddress();
  }, [editId]);

  const fetchAddress = async () => {
    try {
      const res = await customerAPI.getAddressById(editId);
      const addr = res.data.data;
      setForm({
        address_type: addr.address_type || "Home",
        address_line_1: addr.address_line_1 || "",
        address_line_2: addr.address_line_2 || "",
        city: addr.city || "",
        state: addr.state || "",
        zip_code: addr.zip_code || "",
        latitude: addr.latitude ? parseFloat(addr.latitude) : null,
        longitude: addr.longitude ? parseFloat(addr.longitude) : null,
        is_default: addr.is_default || false,
      });
    } catch (e) {
      Alert.alert("Error", "Could not load address details");
      router.back();
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      setForm((prev) => ({
        ...prev,
        latitude: selectedLocation.lat || prev.latitude,
        longitude: selectedLocation.lng || prev.longitude,
        city: selectedLocation.city || prev.city || "",
        state: selectedLocation.state || prev.state || "",
        zip_code: selectedLocation.pincode || prev.zip_code || "",
        address_line_2: selectedLocation.addressLine || prev.address_line_2 || "",
      }));
    }
  }, [selectedLocation]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.address_line_1 || !form.city || !form.state || !form.zip_code) {
      Alert.alert("Missing Fields", "Please fill Address Line 1, City, State, and Zip Code.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert("Location Required", "Please select a delivery location on the map.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await customerAPI.updateAddress(editId, form);
        Alert.alert("Updated", "Address updated successfully!");
      } else {
        await customerAPI.addAddress(form);
        Alert.alert("Saved", "Address added successfully!");
      }
      router.back();
    } catch (e) {
      console.error("Save Address Failed", e);
      Alert.alert("Error", e.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#F8FAF9" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const hasLocation = form.latitude && form.longitude;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ backgroundColor: "#F8FAF9" }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-6 mt-1">
          <Text className="text-2xl font-bold" style={{ color: "#111827", letterSpacing: -0.5 }}>
            {isEditMode ? "Edit Address" : "New Address"}
          </Text>
          <Text className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {isEditMode ? "Update your delivery details" : "Add a new delivery address"}
          </Text>
        </View>

        {/* Address Type Selector */}
        <Text className="text-xs font-bold uppercase mb-3" style={{ color: "#9CA3AF", letterSpacing: 1 }}>
          Address Type
        </Text>
        <View className="flex-row mb-7 gap-3">
          {ADDRESS_TYPES.map((type) => {
            const isActive = form.address_type === type.key;
            return (
              <TouchableOpacity
                key={type.key}
                onPress={() => handleChange("address_type", type.key)}
                activeOpacity={0.8}
                className="flex-1 items-center rounded-2xl py-3.5"
                style={{
                  backgroundColor: isActive ? "#16a34a" : "white",
                  borderWidth: 1.5,
                  borderColor: isActive ? "#16a34a" : "#E5E7EB",
                  shadowColor: isActive ? "#16a34a" : "transparent",
                  shadowOffset: { width: 0, height: isActive ? 4 : 0 },
                  shadowOpacity: isActive ? 0.2 : 0,
                  shadowRadius: 8,
                  elevation: isActive ? 4 : 0,
                }}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={isActive ? "white" : "#9CA3AF"}
                />
                <Text
                  className="font-bold text-sm mt-1"
                  style={{ color: isActive ? "white" : "#6B7280" }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Map Location Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/location/map?returnTo=back")}
          className="rounded-2xl mb-7 overflow-hidden"
          style={{
            backgroundColor: hasLocation ? "#F0FDF4" : "white",
            borderWidth: 1.5,
            borderColor: hasLocation ? "#BBF7D0" : "#E5E7EB",
            borderStyle: hasLocation ? "solid" : "dashed",
          }}
        >
          <View className="p-4 flex-row items-center">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: hasLocation ? "#DCFCE7" : "#F3F4F6" }}
            >
              <Ionicons
                name={hasLocation ? "checkmark-circle" : "map-outline"}
                size={24}
                color={hasLocation ? "#16a34a" : "#9CA3AF"}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-bold text-sm"
                style={{ color: hasLocation ? "#15803D" : "#374151" }}
              >
                {hasLocation ? "Location Set" : "Set Delivery Pin"}
              </Text>
              <Text
                className="text-xs mt-0.5 leading-4"
                style={{ color: hasLocation ? "#16a34a" : "#9CA3AF" }}
                numberOfLines={2}
              >
                {hasLocation
                  ? selectedLocation?.addressLine || `${form.city || "Pin dropped on map"}`
                  : "Tap to drop a pin on the map for accurate delivery"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={hasLocation ? "#16a34a" : "#D1D5DB"}
            />
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <Text className="text-xs font-bold uppercase mb-3" style={{ color: "#9CA3AF", letterSpacing: 1 }}>
          Address Details
        </Text>

        <View className="rounded-2xl overflow-hidden mb-7" style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#F3F4F6" }}>
          {/* Address Line 1 */}
          <View className="px-4 py-3.5" style={{ borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
            <Text className="text-xs font-semibold mb-1" style={{ color: "#9CA3AF" }}>
              House / Flat No. *
            </Text>
            <TextInput
              className="text-base"
              style={{ color: "#111827", padding: 0 }}
              placeholder="e.g. Flat 4B, XYZ Apartments"
              placeholderTextColor="#D1D5DB"
              value={form.address_line_1}
              onChangeText={(t) => handleChange("address_line_1", t)}
            />
          </View>

          {/* Address Line 2 */}
          <View className="px-4 py-3.5" style={{ borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
            <Text className="text-xs font-semibold mb-1" style={{ color: "#9CA3AF" }}>
              Area / Landmark
            </Text>
            <TextInput
              className="text-base"
              style={{ color: "#111827", padding: 0 }}
              placeholder="Near Metro Station, Sector 62"
              placeholderTextColor="#D1D5DB"
              value={form.address_line_2}
              onChangeText={(t) => handleChange("address_line_2", t)}
            />
          </View>

          {/* City + State Row */}
          <View className="flex-row" style={{ borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
            <View className="flex-1 px-4 py-3.5" style={{ borderRightWidth: 1, borderRightColor: "#F3F4F6" }}>
              <Text className="text-xs font-semibold mb-1" style={{ color: "#9CA3AF" }}>
                City *
              </Text>
              <TextInput
                className="text-base"
                style={{ color: "#111827", padding: 0 }}
                placeholder="City"
                placeholderTextColor="#D1D5DB"
                value={form.city}
                onChangeText={(t) => handleChange("city", t)}
              />
            </View>
            <View className="flex-1 px-4 py-3.5">
              <Text className="text-xs font-semibold mb-1" style={{ color: "#9CA3AF" }}>
                State *
              </Text>
              <TextInput
                className="text-base"
                style={{ color: "#111827", padding: 0 }}
                placeholder="State"
                placeholderTextColor="#D1D5DB"
                value={form.state}
                onChangeText={(t) => handleChange("state", t)}
              />
            </View>
          </View>

          {/* Zip Code */}
          <View className="px-4 py-3.5">
            <Text className="text-xs font-semibold mb-1" style={{ color: "#9CA3AF" }}>
              Zip Code *
            </Text>
            <TextInput
              className="text-base"
              style={{ color: "#111827", padding: 0 }}
              placeholder="110001"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={form.zip_code}
              onChangeText={(t) => handleChange("zip_code", t)}
              maxLength={6}
            />
          </View>
        </View>

        {/* Default Toggle */}
        <TouchableOpacity
          onPress={() => {
            // If editing and it's their ONLY address, it MUST be the default.
            // (We assume if they are editing the default and it's the only one, we shouldn't let them uncheck it)
            // But since we don't have the full address list here, we rely on the backend validation as the ultimate source of truth,
            // visually we can just toggle it as normal or warn them on submit.
            handleChange("is_default", !form.is_default);
          }}
          activeOpacity={0.8}
          className="flex-row items-center rounded-2xl p-4 mb-8"
          style={{
            backgroundColor: form.is_default ? "#F0FDF4" : "white",
            borderWidth: 1.5,
            borderColor: form.is_default ? "#BBF7D0" : "#E5E7EB",
          }}
        >
          <View
            className="w-6 h-6 rounded-lg items-center justify-center mr-3"
            style={{
              backgroundColor: form.is_default ? "#16a34a" : "white",
              borderWidth: form.is_default ? 0 : 1.5,
              borderColor: "#D1D5DB",
            }}
          >
            {form.is_default && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <View className="flex-1">
            <Text className="font-bold text-sm" style={{ color: "#111827" }}>
              Set as default address
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
              Used automatically at checkout
            </Text>
          </View>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
          className="rounded-2xl py-4.5 items-center"
          style={{
            backgroundColor: loading ? "#D1D5DB" : "#16a34a",
            paddingVertical: 18,
            shadowColor: loading ? "transparent" : "#16a34a",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: loading ? 0 : 0.3,
            shadowRadius: 12,
            elevation: loading ? 0 : 6,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base" style={{ letterSpacing: 0.3 }}>
              {isEditMode ? "Update Address" : "Save Address"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
