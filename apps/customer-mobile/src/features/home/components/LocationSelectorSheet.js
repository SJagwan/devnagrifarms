import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";
import { useAuth } from "@context/AuthContext";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function LocationSelectorSheet({ isVisible, onClose }) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["50%", "75%"], []);
  const router = useRouter();
  const { saveLocation, selectedLocation } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
      fetchAddresses();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  // Re-fetch and re-expand when the screen comes back into focus (e.g., after adding an address)
  useFocusEffect(
    useCallback(() => {
      if (isVisible) {
        bottomSheetRef.current?.expand();
        fetchAddresses();
      }
    }, [isVisible])
  );

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAddresses();
      if (res.data?.data) {
        setAddresses(res.data.data);
      }
    } catch (e) {
      console.log("Failed to load addresses", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (address) => {
    const formattedLocation = {
      address_line1: address.address_line1,
      address_line2: address.address_line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.label || address.type || "Other",
      lat: address.lat,
      lng: address.lng,
    };
    await saveLocation(formattedLocation);
    onClose();
  };

  // Render Backdrop to fade everything behind the sheet
  const renderBackdrop = (props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose={true}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <BottomSheetView className="flex-1 px-6 pb-6 bg-gray-50/50">
        <View className="flex-row items-center justify-between mb-5 mt-2">
          <Text className="text-2xl font-black text-gray-900 tracking-tight">
            Delivery Location
          </Text>
          <Pressable onPress={onClose} className="p-1 bg-gray-200/50 rounded-full">
            <Ionicons name="close" size={20} color="#666" />
          </Pressable>
        </View>

        {/* Action column */}
        <View className="space-y-3 gap-3 mb-6">
          <Pressable 
            className="w-full bg-green-600 rounded-2xl p-4 flex-row items-center justify-between shadow-sm active:opacity-90"
            onPress={() => {
              // Don't close, so it stays open when we come back
              router.push("/location/check");
            }}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="navigate" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white font-bold text-base">Use current location</Text>
                <Text className="text-green-50 text-xs">Using GPS</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </Pressable>

          <Pressable 
            className="w-full bg-white border border-green-100 rounded-2xl p-4 flex-row items-center justify-between shadow-sm active:opacity-90"
            onPress={() => {
              // Don't close, so it stays open when we come back
              router.push("/account/addresses");
            }}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="add" size={24} color="#16a34a" />
              </View>
              <View>
                <Text className="text-gray-900 font-bold text-base">Add new address</Text>
                <Text className="text-gray-500 text-xs">For faster checkout</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#16a34a" />
          </Pressable>
        </View>

        <View className="flex-row items-center mb-4">
          <View className="h-[1px] flex-1 bg-gray-200" />
          <Text className="mx-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Saved Addresses</Text>
          <View className="h-[1px] flex-1 bg-gray-200" />
        </View>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="small" color="#16a34a" />
            <Text className="text-gray-400 mt-2 text-xs font-medium uppercase tracking-widest">Searching your places...</Text>
          </View>
        ) : addresses.length > 0 ? (
          <BottomSheetFlatList
            data={addresses}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const isActive = selectedLocation && selectedLocation.address_line1 === item.address_line1;
              
              let iconName = "location-outline";
              let iconBg = "bg-blue-50";
              let iconColor = "#2563eb";

              if (item.label === "Home") {
                iconName = "home";
                iconBg = "bg-orange-50";
                iconColor = "#ea580c";
              } else if (item.label === "Work") {
                iconName = "briefcase";
                iconBg = "bg-purple-50";
                iconColor = "#9333ea";
              }

              return (
                <Pressable
                  className={`flex-row items-center p-4 mb-3 rounded-2xl border ${
                    isActive ? "border-green-500 bg-white shadow-md shadow-green-100" : "border-gray-100 bg-white"
                  }`}
                  onPress={() => handleSelectAddress(item)}
                >
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isActive ? "bg-green-100" : iconBg}`}>
                    <Ionicons name={isActive ? "checkmark-circle" : iconName} size={24} color={isActive ? "#16a34a" : iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-black text-base ${isActive ? "text-gray-900" : "text-gray-900"}`}>
                      {item.label || "Other"}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5 leading-4" numberOfLines={1}>
                      {item.address_line1}, {item.city}
                    </Text>
                  </View>
                  {isActive ? (
                    <View className="bg-green-100 px-2 py-1 rounded-md">
                      <Text className="text-[10px] font-black text-green-700 uppercase">Selected</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  )}
                </Pressable>
              );
            }}
          />
        ) : (
           <View className="py-12 items-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
             <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
               <Ionicons name="map-outline" size={32} color="#9CA3AF" />
             </View>
             <Text className="text-gray-400 font-bold text-center">No saved addresses yet</Text>
             <Text className="text-gray-300 text-xs text-center mt-1">Add your home or work for quick ordering</Text>
           </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
