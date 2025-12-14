import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAPI } from "../../lib/api";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LocationCheck() {
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
      const { data } = await authAPI.checkServiceability({ pincode });

      if (data.data.serviceable) {
        Alert.alert("Great News!", "We deliver to your area.", [
          { text: "Continue Shopping", onPress: () => router.replace("/") },
        ]);
      } else {
        Alert.alert(
          "Creating Demand",
          "We don't deliver here yet, but we've noted your interest!",
          [{ text: "Browse Anyway", onPress: () => router.replace("/") }]
        );
      }
    } catch (error) {
      // Allow user to proceed even if API fails for MVP
      Alert.alert(
        "Service Check Failed",
        "Could not verify location. Proceeding anyway.",
        [{ text: "Continue", onPress: () => router.replace("/") }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6 justify-center">
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

        <View className="mt-4 items-center">
          <Text className="text-gray-400 text-sm">
            We currently serve limited areas in Delhi/NCR.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
