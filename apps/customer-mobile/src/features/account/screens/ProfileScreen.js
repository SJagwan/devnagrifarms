import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@context/AuthContext";
import { customerAPI } from "@lib/api";
import Input from "@shared/components/Input";
import Button from "@shared/components/Button";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      const names = user.name ? user.name.split(" ") : ["", ""];
      const first_name = names[0] || "";
      const last_name = names.slice(1).join(" ") || "";
      
      const data = {
        first_name: user.first_name || first_name,
        last_name: user.last_name || last_name,
        email: user.email || "",
      };
      
      setInitialData(data);
      setFormData(data);
    }
  }, [user]);

  const isDirty = useMemo(() => {
    return (
      formData.first_name.trim() !== initialData.first_name ||
      formData.last_name.trim() !== initialData.last_name ||
      formData.email.trim() !== initialData.email
    );
  }, [formData, initialData]);

  const handleUpdate = async () => {
    if (!formData.first_name.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }

    setLoading(true);
    try {
      await customerAPI.updateProfile(formData);
      await refreshUser();
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerTitle: "Edit Profile" }} />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 60, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-2">Phone Number</Text>
            <View className="bg-gray-100 p-4 rounded-xl border border-gray-200">
              <Text className="text-gray-700 font-medium">+91 {user.phone}</Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1">Phone number cannot be changed</Text>
          </View>

          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            spellCheck={false}
          />

          <View className="mt-8">
            <Button 
              title="Save Changes" 
              onPress={handleUpdate} 
              loading={loading}
              disabled={!isDirty || loading}
              variant={isDirty ? "primary" : "secondary"}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
