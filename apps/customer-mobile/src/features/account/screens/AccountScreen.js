import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@context/AuthContext";
import Button from "@shared/components/Button";

const MENU_SECTIONS = [
  {
    title: "My Account",
    items: [
      { icon: "person-outline", label: "Profile", route: "/account/profile" },
      {
        icon: "location-outline",
        label: "Addresses",
        route: "/account/addresses",
      },
      {
        icon: "card-outline",
        label: "Payment Methods",
        route: "/account/payments",
      },
    ],
  },
  {
    title: "Orders",
    items: [
      {
        icon: "receipt-outline",
        label: "Order History",
        route: "/account/orders",
      },
      {
        icon: "refresh-outline",
        label: "Subscriptions",
        route: "/account/subscriptions",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: "help-circle-outline",
        label: "Help & FAQ",
        route: "/account/help",
      },
      {
        icon: "chatbubble-outline",
        label: "Contact Us",
        route: "/account/contact",
      },
      {
        icon: "document-text-outline",
        label: "Terms & Policies",
        route: "/account/terms",
      },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleMenuPress = (route) => {
    if (route === "/account/addresses") {
      router.push(route);
      return;
    }
    Alert.alert("Coming Soon", "This feature will be available soon!");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerTitle: "Account" }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-2xl border border-gray-100">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center">
              <Ionicons name="person" size={32} color="#16a34a" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {user?.name || "Customer"}
              </Text>
              <Text className="text-gray-500 text-sm">
                {user?.phone || user?.email || "No contact info"}
              </Text>
            </View>
            <Pressable
              onPress={() => handleMenuPress("/account/profile")}
            >
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mt-6">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              {section.title}
            </Text>
            <View className="bg-white mx-4 rounded-2xl border border-gray-100 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  onPress={() => handleMenuPress(item.route)}
                  className="flex-row items-center px-4 py-4"
                  style={
                    itemIndex < section.items.length - 1
                      ? { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }
                      : undefined
                  }
                >
                  <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                    <Ionicons name={item.icon} size={20} color="#6B7280" />
                  </View>
                  <Text className="flex-1 ml-3 text-gray-900 font-medium">
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View className="mx-4 mt-6 mb-8">
          <Button title="Logout" variant="danger" onPress={handleLogout} />
        </View>

        {/* App Version */}
        <Text className="text-center text-gray-400 text-xs mb-8">
          Devnagri Farms v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
