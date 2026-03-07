import { useState } from "react";
import { View, Text, Alert, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Location from 'expo-location';
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";
import { useAuth } from "@context/AuthContext";
import Input from "@shared/components/Input";
import Button from "@shared/components/Button";

export default function LocationCheckScreen() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState(null);
  
  // State variables for UI feedback
  const [serviceableStatus, setServiceableStatus] = useState("idle"); // 'idle' | 'success' | 'failure'
  const [serviceableMessage, setServiceableMessage] = useState("");
  const [validatedAddress, setValidatedAddress] = useState(null);
  
  const router = useRouter();
  const { setLocationChecked, saveLocation } = useAuth();

  const handleSuccess = (addressObj) => {
    setValidatedAddress(addressObj);
    setServiceableStatus("success");
  };

  const handleFailure = (message) => {
    setServiceableMessage(message || "We don't serve this area yet.");
    setServiceableStatus("failure");
  };

  const handleAutoDetect = async () => {
    setGpsLoading(true);
    setLoadingStatus("Requesting permissions...");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Please allow location access in your device settings, or enter a pincode manually.");
        setUseManual(true);
        setGpsLoading(false);
        return;
      }

      setLoadingStatus("Acquiring high-accuracy GPS signal...");
      // Use High accuracy to prevent false negatives on polygon borders
      let location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High 
      });
      const { latitude, longitude } = location.coords;

      setLoadingStatus("Identifying your neighborhood...");
      // Reverse geocode to build trust by showing the user where we think they are
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let addressString = "Unknown Location";
      let city = "";
      let state = "";
      let detectedPincode = "";
      
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        // e.g., "Sector 62, Noida" or "Koramangala, Bengaluru"
        const parts = [];
        if (place.subregion || place.district) parts.push(place.subregion || place.district);
        if (place.city) parts.push(place.city);
        
        city = place.city || place.district || place.subregion || "";
        state = place.region || "";

        if (parts.length === 0 && state) parts.push(state);
        
        addressString = parts.join(", ") || "Current Location";
        if (place.postalCode) {
            detectedPincode = place.postalCode;
            setPincode(place.postalCode);
        }
      }

      const addressObj = {
          lat: latitude,
          lng: longitude,
          addressLine: addressString,
          city: city,
          state: state,
          pincode: detectedPincode,
          source: 'gps'
      };

      setDetectedAddress({
          text: addressString,
          lat: latitude,
          lng: longitude
      });

      setLoadingStatus("Verifying delivery availability...");
      const { data } = await customerAPI.checkServiceability({ lat: latitude, lng: longitude, pincode: detectedPincode });

      if (data.data?.serviceable) {
        handleSuccess(addressObj);
      } else {
        handleFailure(`We currently don't deliver to ${addressString}.`);
      }
    } catch (error) {
      console.log("GPS check failed", error);
      Alert.alert("Error", "Could not fetch your location precisely. Please enter your pincode manually.");
      setUseManual(true);
    } finally {
      setGpsLoading(false);
      setLoadingStatus("");
    }
  };

  const handlePincodeCheck = async () => {
    if (pincode.length < 6) {
      Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    try {
      // 1. Geocode the pincode to get approx lat/lng
      let lat = null;
      let lng = null;
      let city = "Serviceable Area";
      let state = "";
      let addressLine = `Pincode Area (${pincode})`;

      const geocodeResult = await Location.geocodeAsync(pincode);
      if (geocodeResult && geocodeResult.length > 0) {
          lat = geocodeResult[0].latitude;
          lng = geocodeResult[0].longitude;

          // Attempt to reverse geocode to get a better name if possible
          const reverseResult = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (reverseResult && reverseResult.length > 0) {
              const place = reverseResult[0];
              city = place.city || place.district || place.subregion || city;
              state = place.region || "";

              const parts = [];
              if (place.subregion || place.district) parts.push(place.subregion || place.district);
              if (place.city) parts.push(place.city);
              if (parts.length > 0) addressLine = parts.join(", ");
          }
      }

      // 2. Pass lat/lng and pincode to API
      const { data } = await customerAPI.checkServiceability({ lat, lng, pincode });

      if (data.data?.serviceable) {
        handleSuccess({
            lat: lat,
            lng: lng,
            addressLine: addressLine,
            pincode: pincode,
            city: city,
            state: state,
            source: 'manual'
        });
      } else {
        handleFailure("We currently don't deliver to this pincode.");
      }
    } catch (error) {
      console.log("Pincode check failed", error);
      handleFailure("Could not verify serviceability at this time.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await setLocationChecked(true);
    router.replace("/(tabs)");
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }} 
      contentContainerClassName="justify-center"
      className="bg-white p-6"
    >
      <View className="items-center mb-8 mt-12">
        <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-4">
          <Ionicons name="location" size={40} color="#16a34a" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
          Where are you?
        </Text>
        <Text className="text-gray-500 text-center px-4 leading-5">
          We need your location to show available farm-fresh produce in your area.
        </Text>
      </View>

      {serviceableStatus === 'success' && validatedAddress ? (
        <View className="bg-green-50 p-6 rounded-2xl border border-green-100 items-center mt-2">
            <Ionicons name="checkmark-circle" size={60} color="#16a34a" />
            <Text className="text-2xl font-bold text-green-900 text-center mt-2">Great News!</Text>
            <Text className="text-green-800 text-center text-lg mt-1">We deliver to your location</Text>
            
            <View className="w-full bg-white p-4 rounded-xl mt-6 border border-green-200 items-start shadow-sm">
                <View className="flex-row items-center mb-1">
                    <Ionicons name="location-sharp" size={20} color="#16a34a" />
                    <Text className="ml-2 text-gray-800 font-semibold flex-1" numberOfLines={2}>{validatedAddress.addressLine}</Text>
                </View>
                {validatedAddress.pincode ? (
                  <Text className="text-gray-500 ml-7">Pin: {validatedAddress.pincode}</Text>
                ) : null}
            </View>

            <View className="w-full mt-6 space-y-3">
                <Button 
                    title="Continue Shopping" 
                    onPress={async () => {
                        if (saveLocation) {
                            await saveLocation(validatedAddress);
                        } else {
                            await setLocationChecked(true);
                        }
                        router.replace("/(tabs)");
                    }} 
                />
                <Pressable onPress={() => {
                    setServiceableStatus('idle');
                    setUseManual(true);
                    setPincode('');
                }} className="py-3 items-center mt-2">
                    <Text className="text-green-700 font-bold">Change Location</Text>
                </Pressable>
            </View>
        </View>
      ) : serviceableStatus === 'failure' ? (
         <View className="space-y-4 bg-red-50 p-6 rounded-2xl border border-red-100 items-center mt-2">
            <Ionicons name="location-outline" size={60} color="#dc2626" />
            <Text className="text-2xl font-bold text-red-900 text-center">Oops!</Text>
            <Text className="text-red-800 text-center text-lg">{serviceableMessage}</Text>
            <Text className="text-red-700 text-center text-sm mt-2 mb-4">You can try entering a different location manually.</Text>
            <View className="w-full">
                <Button 
                    title="Enter Location Manually" 
                    onPress={() => {
                        setServiceableStatus('idle');
                        setUseManual(true);
                        setPincode('');
                    }} 
                />
            </View>
         </View>
      ) : !useManual ? (
        <View className="space-y-4">
          <Pressable 
            onPress={handleAutoDetect} 
            disabled={gpsLoading}
            className={`w-full p-4 rounded-xl flex-row items-center justify-center shadow-sm ${gpsLoading ? 'bg-green-800' : 'bg-green-600'}`}
          >
            {gpsLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg ml-2">Use Current Location</Text>
              </>
            )}
          </Pressable>

          {gpsLoading && (
            <Text className="text-center text-sm text-gray-500 mt-2 animate-pulse">
              {loadingStatus}
            </Text>
          )}

          {detectedAddress && !gpsLoading && (
            <View className="bg-green-50 p-4 rounded-xl border border-green-100 mt-4 flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                <View className="ml-3 flex-1">
                    <Text className="text-green-800 text-xs font-bold">Detected Region</Text>
                    <Text className="text-green-900 font-medium">{detectedAddress.text}</Text>
                </View>
            </View>
          )}

          {!gpsLoading && (
             <Pressable onPress={() => setUseManual(true)} className="p-4 items-center mt-2">
               <Text className="text-green-600 font-bold">Enter pincode manually</Text>
             </Pressable>
          )}
        </View>
      ) : (
        <View className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <Input
            label="Pincode"
            placeholder="e.g. 110001"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <Button
            title="Check Availability"
            onPress={handlePincodeCheck}
            loading={loading}
          />
          <Pressable onPress={() => setUseManual(false)} className="mt-4 items-center">
            <Text className="text-gray-500 font-medium">← Back to auto-detect</Text>
          </Pressable>
        </View>
      )}

      {/* Skip button for development/testing */}
      {serviceableStatus === 'idle' && (
        <View className="mt-auto pt-8 pb-4 items-center">
          <Pressable onPress={handleSkip}>
            <Text className="text-gray-400 text-sm underline">Skip for now (Testing)</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
