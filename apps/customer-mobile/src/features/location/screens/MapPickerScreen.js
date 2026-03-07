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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        router.back();
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setInitialRegion(region);
      // Wait for map to settle before reverse geocoding
      handleRegionChangeComplete(region);
    })();
  }, []);

  const debouncedLocationCheck = useRef(
    debounce(async (lat, lng) => {
      try {
        setLoading(true);

        // 1. Reverse geocode to get address details
        const geocode = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        let addressString = "Unknown Location";
        let city = "";
        let state = "";
        let detectedPincode = "";

        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const parts = [];
          if (place.subregion || place.district) parts.push(place.subregion || place.district);
          if (place.city) parts.push(place.city);
          
          city = place.city || place.district || place.subregion || "";
          state = place.region || "";

          if (parts.length === 0 && state) parts.push(state);

          addressString = parts.join(", ") || "Selected Location";
          if (place.postalCode) {
            detectedPincode = place.postalCode;
          }
        }

        const newAddress = {
          lat,
          lng,
          addressLine: addressString,
          city,
          state,
          pincode: detectedPincode,
          source: "gps",
        };
        
        setAddress(newAddress);

        // 2. Check serviceability against the backend
        const { data } = await customerAPI.checkServiceability({
          lat,
          lng,
          pincode: detectedPincode,
        });

        setIsServiceable(!!data?.data?.serviceable);
      } catch (error) {
        console.log("Error verifying location:", error);
        setIsServiceable(false);
      } finally {
        setLoading(false);
      }
    }, 800)
  ).current;

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
