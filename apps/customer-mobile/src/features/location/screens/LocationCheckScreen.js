import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { customerAPI } from "@lib/api";
import Input from "@shared/components/Input";
import Button from "@shared/components/Button";

export default function LocationCheckScreen() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheck = async () => {
    if (pincode.length < 6) {
      Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    try {
      const { data } = await customerAPI.checkServiceability({ pincode });

      if (data.data?.serviceable) {
        Alert.alert("Great News!", "We deliver to your area.", [
          {
            text: "Continue Shopping",
            onPress: () => router.replace("/(tabs)"),
          },
        ]);
      } else {
        // For testing: allow user to proceed even if not serviceable
        Alert.alert("Note", "Service check completed. Proceeding to app.", [
          { text: "Continue", onPress: () => router.replace("/(tabs)") },
        ]);
      }
    } catch (error) {
      // For testing: allow user to proceed even if API fails
      console.log("Location check failed, proceeding anyway for testing");
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  // Skip button for testing
  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Location Check
        </Text>
        <Text className="text-gray-600 mb-8">
          Enter your delivery pincode to check availability
        </Text>

        <Input
          label="Pincode"
          placeholder="110001"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
        />

        <Button
          title="Check Availability"
          onPress={handleCheck}
          loading={loading}
        />

        {/* Skip button for testing */}
        <View className="mt-4">
          <Button
            title="Skip for now (Testing)"
            variant="outline"
            onPress={handleSkip}
          />
        </View>

        <View className="mt-4 items-center">
          <Text className="text-gray-400 text-sm">
            We currently serve limited areas in Delhi/NCR.
          </Text>
        </View>
      </View>
    </View>
  );
}
