import { Stack } from "expo-router";

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "white" },
        headerTitleStyle: { fontWeight: "600", color: "#111827" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Orders" }} />
      <Stack.Screen name="[id]" options={{ title: "Order Details" }} />
    </Stack>
  );
}
