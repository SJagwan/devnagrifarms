import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAPI } from "@lib/apiClient";
import { useAuth } from "@context/AuthContext";
import Input from "@shared/components/Input";
import Button from "@shared/components/Button";

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP(phone, otp);
      await login(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Navigate to location check instead of home directly
      router.replace("/location/check");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6 justify-center">
      <View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Verify Phone
        </Text>
        <Text className="text-gray-600 mb-8">
          Enter the code sent to +91 {phone}
        </Text>

        <Input
          label="OTP Code"
          placeholder="123456"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}
