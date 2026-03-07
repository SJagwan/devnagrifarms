import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@context/AuthContext";
import { CartProvider } from "@context/CartContext";

function RootLayoutNav() {
  const { user, loading, hasCheckedLocation } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup) {
      // router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      if (!hasCheckedLocation) {
        router.replace("/location/check");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [user, loading, hasCheckedLocation, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="product" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <SafeAreaView
              style={{ flex: 1, backgroundColor: "white" }}
              edges={["top", "left", "right"]}
            >
              <RootLayoutNav />
            </SafeAreaView>
          </SafeAreaProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
