import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { customerAPI } from "@lib/api";
import ActionSheet from "@shared/components/ActionSheet";

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reusable Action Sheet State
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

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
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    router.push("/account/add-address");
  };

  const handleSetDefault = async (addressId) => {
    try {
      await customerAPI.setDefaultAddress(addressId);
      fetchAddresses();
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Failed to set default");
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to remove this address? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await customerAPI.deleteAddress(addressId);
              fetchAddresses();
            } catch (e) {
              Alert.alert(
                "Cannot Delete",
                e.response?.data?.message || "Failed to delete address"
              );
            }
          },
        },
      ]
    );
  };

  const handleEdit = (addressId) => {
    router.push(`/account/edit-address?id=${addressId}`);
  };

  // Triggers the Action Sheet UI
  const showActions = (addr) => {
    setSelectedAddress(addr);
    setSheetVisible(true);
  };

  // Formats options for ActionSheet
  const getActionOptions = () => {
    if (!selectedAddress) return [];
    
    const opts = [
      {
        label: "Edit Address",
        description: "Modify address details like flat no or area",
        icon: "pencil",
        onPress: () => handleEdit(selectedAddress.id),
      },
    ];

    if (!selectedAddress.is_default) {
      opts.push({
        label: "Set as Default",
        description: "Automatically use this address at checkout",
        icon: "checkmark-circle",
        onPress: () => handleSetDefault(selectedAddress.id),
      });

      opts.push({
        label: "Delete Address",
        description: "Remove this address permanently",
        icon: "trash",
        destructive: true,
        onPress: () => handleDelete(selectedAddress.id),
      });
    }

    return opts;
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home": return "home";
      case "work": return "briefcase";
      default: return "location";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#F8FAF9" }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#16a34a"
            colors={["#16a34a"]}
          />
        }
      >
        {/* Header Section */}
        <View className="mb-6 mt-2">
          <Text className="text-2xl font-bold" style={{ color: "#111827", letterSpacing: -0.5 }}>
            My Addresses
          </Text>
          <Text className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {addresses.length > 0
              ? `${addresses.length} saved address${addresses.length > 1 ? "es" : ""}`
              : "Save addresses for faster checkout"}
          </Text>
        </View>

        {addresses.length === 0 ? (
          /* Empty State */
          <View className="items-center justify-center mt-12 px-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: "#ECFDF5" }}
            >
              <Ionicons name="location-outline" size={40} color="#16a34a" />
            </View>
            <Text className="text-lg font-bold text-center" style={{ color: "#111827" }}>
              No addresses yet
            </Text>
            <Text className="text-sm text-center mt-2 leading-5" style={{ color: "#9CA3AF" }}>
              Add your home or work address to speed up checkout and get accurate delivery estimates.
            </Text>
            <TouchableOpacity
              onPress={handleAddAddress}
              className="mt-6 rounded-2xl px-8 py-4 flex-row items-center"
              style={{ backgroundColor: "#16a34a" }}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Add Your First Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Address Cards */
          addresses.map((addr, index) => (
            <View
              key={addr.id}
              className="mb-4 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "white",
                shadowColor: addr.is_default ? "#16a34a" : "#000",
                shadowOffset: { width: 0, height: addr.is_default ? 4 : 2 },
                shadowOpacity: addr.is_default ? 0.12 : 0.06,
                shadowRadius: addr.is_default ? 12 : 8,
                elevation: addr.is_default ? 6 : 3,
              }}
            >
              <View className="flex-row">
                {/* Left Accent Strip */}
                <LinearGradient
                  colors={addr.is_default ? ["#16a34a", "#22c55e"] : ["#E5E7EB", "#D1D5DB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ width: 5 }}
                />

                {/* Card Content */}
                <View className="flex-1 p-4">
                  {/* Top Row: Icon + Type + Badge + Menu */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: addr.is_default ? "#ECFDF5" : "#F3F4F6",
                        }}
                      >
                        <Ionicons
                          name={getIcon(addr.address_type)}
                          size={20}
                          color={addr.is_default ? "#16a34a" : "#6B7280"}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text
                            className="font-bold text-base capitalize"
                            style={{ color: "#111827" }}
                          >
                            {addr.address_type}
                          </Text>
                          {addr.is_default && (
                            <View
                              className="ml-2 px-2.5 py-0.5 rounded-full"
                              style={{ backgroundColor: "#DCFCE7" }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: "#15803D" }}
                              >
                                Default
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => showActions(addr)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: "#F9FAFB" }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="ellipsis-horizontal" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {/* Address Lines */}
                  <Text
                    className="text-sm leading-5"
                    style={{ color: "#374151" }}
                  >
                    {addr.address_line_1}
                    {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}
                  </Text>
                  <Text className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
                    {addr.city}, {addr.state} — {addr.zip_code}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {addresses.length > 0 && (
        <TouchableOpacity
          onPress={handleAddAddress}
          activeOpacity={0.85}
          className="absolute bottom-7 right-5 rounded-2xl flex-row items-center px-5 py-4"
          style={{
            backgroundColor: "#16a34a",
            shadowColor: "#16a34a",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={22} color="white" />
          <Text className="text-white font-bold text-sm ml-1.5">Add New</Text>
        </TouchableOpacity>
      )}

      {/* Reusable Action Sheet Overlay */}
      <ActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={
          selectedAddress
            ? `${selectedAddress.address_line_1}, ${selectedAddress.city}`
            : "Address Options"
        }
        options={getActionOptions()}
      />
    </View>
  );
}
