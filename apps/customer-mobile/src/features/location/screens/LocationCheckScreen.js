import { useState } from "react";
import { View, Text, Alert, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { customerAPI } from "@lib/api";
import { useAuth } from "@context/AuthContext";
import { useLocation } from "../hooks/useLocation";
import Input from "@shared/components/Input";
import Button from "@shared/components/Button";

export default function LocationCheckScreen() {
  const [pincode, setPincode] = useState("");
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState(null);
  
  // State variables for UI feedback
  const [serviceableStatus, setServiceableStatus] = useState("idle"); // 'idle' | 'success' | 'failure'
  const [serviceableMessage, setServiceableMessage] = useState("");
  const [validatedAddress, setValidatedAddress] = useState(null);
  
  const router = useRouter();
  const { setLocationChecked, saveLocation } = useAuth();
  const { detectLocation, getAddressFromPincode, loading: locationLoading, error: locationError } = useLocation();

  const handleSuccess = (addressObj) => {
    setValidatedAddress(addressObj);
    setServiceableStatus("success");
  };

  const handleFailure = (message) => {
    setServiceableMessage(message || "We don't serve this area yet.");
    setServiceableStatus("failure");
  };

  const checkServiceability = async (addressObj) => {
    setCheckingServiceability(true);
    try {
      const { data } = await customerAPI.checkServiceability({ 
        lat: addressObj.lat, 
        lng: addressObj.lng, 
        pincode: addressObj.pincode 
      });

      if (data.data?.serviceable) {
        handleSuccess(addressObj);
      } else {
        handleFailure(`We currently don't deliver to ${addressObj.addressLine}.`);
      }
    } catch (error) {
      console.log("Serviceability check failed", error);
      handleFailure("Could not verify serviceability at this time.");
    } finally {
      setCheckingServiceability(false);
    }
  };

  const handleAutoDetect = async () => {
    try {
      const address = await detectLocation();
      setDetectedAddress({
        text: address.addressLine,
        lat: address.lat,
        lng: address.lng
      });
      await checkServiceability({ ...address, source: 'gps' });
    } catch (err) {
      if (err.message === 'LOCATION_TIMEOUT' || err.message === 'PERMISSION_DENIED') {
        setUseManual(true);
      }
      // Error is already handled by hook and displayed via locationError or alert in hook
    }
  };

  const handlePincodeCheck = async () => {
    if (pincode.length < 6) {
      Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode");
      return;
    }

    try {
      const address = await getAddressFromPincode(pincode);
      await checkServiceability(address);
    } catch (err) {
      console.log("Pincode check failed", err);
    }
  };

  const handleSkip = async () => {
    await setLocationChecked(true);
    router.replace("/(tabs)");
  };

  const isLoading = locationLoading || checkingServiceability;

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
            disabled={isLoading}
            className="w-full p-4 rounded-xl flex-row items-center justify-center shadow-sm"
            style={{ backgroundColor: isLoading ? '#166534' : '#16a34a' }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg ml-2">Use Current Location</Text>
              </>
            )}
          </Pressable>

          {locationLoading && (
            <Text className="text-center text-sm text-gray-500 mt-2 animate-pulse">
              Identifying your neighborhood...
            </Text>
          )}

          {locationError && (
             <Text className="text-center text-sm text-red-500 mt-2">
               {locationError}
             </Text>
          )}

          {detectedAddress && !isLoading && (
            <View className="bg-green-50 p-4 rounded-xl border border-green-100 mt-4 flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                <View className="ml-3 flex-1">
                    <Text className="text-green-800 text-xs font-bold">Detected Region</Text>
                    <Text className="text-green-900 font-medium">{detectedAddress.text}</Text>
                </View>
            </View>
          )}

          {!isLoading && (
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
            loading={isLoading}
          />
          <Pressable onPress={() => setUseManual(false)} className="mt-4 items-center">
            <Text className="text-gray-500 font-medium">← Back to auto-detect</Text>
          </Pressable>
        </View>
      )}

      {/* Skip button for development/testing */}
      {__DEV__ && serviceableStatus === 'idle' && (
        <View className="mt-auto pt-8 pb-4 items-center">
          <Pressable onPress={handleSkip}>
            <Text className="text-gray-400 text-sm underline">Skip for now (Testing)</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
