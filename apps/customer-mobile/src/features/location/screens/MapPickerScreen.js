import React, { useRef, useState, useEffect } from "react";
import { View, Alert } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import debounce from "lodash.debounce";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import CenterPin from "../components/CenterPin";
import AddressBottomSheet from "../components/AddressBottomSheet";
import { customerAPI } from "@lib/api";
import { geocodeService } from "@lib/services/geocode.service";
import { locationService } from "@lib/services/location.service";

export default function MapPickerScreen() {
  const mapRef = useRef(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [initialRegion, setInitialRegion] = useState(null);
  const [address, setAddress] = useState(null);
  const [isServiceable, setIsServiceable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ask for permission and get current location on mount
  useEffect(() => {
    (async () => {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Location access is required.");
        router.back();
        return;
      }

      try {
        const location = await locationService.getCurrentPosition(10000);
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setInitialRegion(region);
        handleRegionChangeComplete(region);
      } catch (err) {
        console.error("MapPicker initial location failed", err);
        // Fallback to a default region (e.g., Delhi) if GPS fails
        const defaultRegion = {
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setInitialRegion(defaultRegion);
        handleRegionChangeComplete(defaultRegion);
      }
    })();
  }, []);

  const debouncedLocationCheck = useRef(
    debounce(async (lat, lng) => {
      try {
        setLoading(true);

        // 1. Reverse geocode using standardized service
        const parsedAddress = await geocodeService.reverseGeocode(lat, lng);
        
        if (parsedAddress) {
          setAddress({ ...parsedAddress, source: "gps" });

          // 2. Check serviceability
          const { data } = await customerAPI.checkServiceability({
            lat,
            lng,
            pincode: parsedAddress.pincode,
          });

          setIsServiceable(!!data?.data?.serviceable);
        } else {
          setIsServiceable(false);
        }
      } catch (error) {
        console.log("Error verifying location:", error);
        setIsServiceable(false);
      } finally {
        setLoading(false);
      }
    }, 800)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => debouncedLocationCheck.cancel();
  }, []);

  const handleRegionChangeComplete = (newRegion) => {
    // Only check if we're not heavily zoomed out
    if (newRegion.latitudeDelta > 0.5) return;
    
    setLoading(true);
    setIsServiceable(null);
    debouncedLocationCheck(newRegion.latitude, newRegion.longitude);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute top-12 left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm elevation-2">
        <Ionicons name="arrow-back" size={24} color="#1f2937" onPress={() => router.back()} />
      </View>
      
      {initialRegion ? (
        <MapView
          ref={mapRef}
          className="flex-1"
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPanDrag={() => setLoading(true)} // Give instant feedback that it's recalculating
        />
      ) : (
        <View className="flex-1 bg-gray-100" />
      )}

      <CenterPin />

      <AddressBottomSheet 
         address={address} 
         isServiceable={isServiceable} 
         loading={loading} 
         onConfirm={() => {
            if (params.returnTo) {
               router.replace(params.returnTo);
            } else {
               router.replace("/(tabs)");
            }
         }}
      />
    </View>
  );
}
