import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "white" },
        headerTitleStyle: { fontWeight: "600", color: "#111827" },
        headerShadowVisible: false,
      }}
    />
  );
}
