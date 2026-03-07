import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@context/AuthContext";

export default function Index() {
  const { user, loading, hasCheckedLocation } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (user) {
    if (!hasCheckedLocation) {
      return <Redirect href="/location/check" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}
