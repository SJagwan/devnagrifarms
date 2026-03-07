import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import Button from "@shared/components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "@context/AuthContext";

export default function AddressBottomSheet({
  address,
  isServiceable,
  loading,
  onConfirm,
}) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["35%", "50%"], []);
  const router = useRouter();
  const { saveLocation, setLocationChecked } = useAuth();

  // If loading or we don't have an address yet, we can keep it at 35%.
  // If we have an address and it's serviceable, we show the confirm button.

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <BottomSheetView className="flex-1 p-6 bg-white">
        {loading ? (
          <View className="flex-1 items-center justify-center space-y-4">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-gray-500 font-medium">
              Checking delivery area...
            </Text>
          </View>
        ) : address ? (
          <View className="flex-1 space-y-4">
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="mt-1">
                <Ionicons name="location" size={24} color="#16a34a" />
              </View>
              <View className="flex-1 pr-4">
                <Text className="text-xl font-bold text-gray-900 mb-1">
                  {address.city ? address.city : "Selected Location"}
                </Text>
                <Text className="text-gray-600 leading-5">
                  {address.addressLine}
                </Text>
              </View>
            </View>

            {isServiceable === true && (
              <View className="bg-green-50 p-3 rounded-lg border border-green-100 flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text className="text-green-800 font-medium ml-2">
                  Great news! We deliver here.
                </Text>
              </View>
            )}

            {isServiceable === false && (
              <View className="bg-red-50 p-3 rounded-lg border border-red-100 flex-row items-center mb-2">
                <Ionicons name="close-circle" size={20} color="#dc2626" />
                <Text className="text-red-800 font-medium ml-2 flex-1">
                  Sorry, we don't deliver to this exact location yet.
                </Text>
              </View>
            )}

            <View className="mt-auto pt-4">
              <Button
                title={
                  isServiceable
                    ? "Confirm Location"
                    : "Location Not Serviceable"
                }
                disabled={!isServiceable}
                onPress={async () => {
                  if (isServiceable) {
                    if (saveLocation) {
                      await saveLocation(address);
                    } else {
                      await setLocationChecked(true);
                    }
                    if (onConfirm) {
                      onConfirm();
                    } else {
                      router.replace("/(tabs)");
                    }
                  }
                }}
              />
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons
              name="map-outline"
              size={48}
              color="#9ca3af"
              className="mb-4"
            />
            <Text className="text-gray-500 font-medium text-center">
              Move the map to select your delivery location.
            </Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
