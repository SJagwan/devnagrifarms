import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { authAPI } from "@lib/api";
import Input from "@shared/components/Input";
import Button from "@shared/components/Button";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-digit mobile number",
      );
      return;
    }

    setLoading(true);
    try {
      await authAPI.requestOTP(phone);
      router.push({ pathname: "/auth/verify", params: { phone } });
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome</Text>
        <Text className="text-gray-600 mb-8">
          Enter your mobile number to continue
        </Text>

        <Input
          label="Mobile Number"
          placeholder="9876543210"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Button title="Get OTP" onPress={handleSendOTP} loading={loading} />
      </View>
    </View>
  );
}
