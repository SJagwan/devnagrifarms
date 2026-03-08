import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@shared/components/Button";
import * as ImagePicker from "expo-image-picker";
import { presignAndUpload, getPublicImageUrl } from "../../../lib/storage";
import api from "../../../lib/apiClient";

const MENU_SECTIONS = [
  {
    title: "My Account",
    items: [
      { icon: "person-outline", label: "Edit Profile", route: "/account/profile" },
      {
        icon: "location-outline",
        label: "Addresses",
        route: "/account/addresses",
      },
      {
        icon: "wallet-outline",
        label: "My Wallet",
        route: "/wallet",
      },
    ],
  },
  {
    title: "Orders",
    items: [
      {
        icon: "receipt-outline",
        label: "Order History",
        route: "/orders",
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
  const { user, logout, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

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
    if (
      route === "/account/profile" ||
      route === "/account/addresses" ||
      route === "/orders" ||
      route === "/account/subscriptions" ||
      route === "/wallet"
    ) {
      router.push(route);
      return;
    }
    Alert.alert("Coming Soon", "This feature will be available soon!");
  };

  const handleUpdateAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to allow access to your photos to update your profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setIsUploading(true);

      const { key } = await presignAndUpload({
        fileUri: asset.uri,
        fileName: asset.fileName || asset.uri.split('/').pop() || 'avatar.jpg',
        mimeType: asset.mimeType || "image/jpeg",
      });

      const publicUrl = getPublicImageUrl(key);

      await api.put("/profile", {
        first_name: user?.first_name || user?.name?.split(' ')[0] || "Customer",
        last_name: user?.last_name || user?.name?.split(' ').slice(1).join(' ') || "",
        avatar_url: publicUrl,
      });

      await refreshUser();
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerTitle: "Account", headerTitleStyle: { fontWeight: '900' } }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium User Card */}
        <View className="mx-4 mt-6 shadow-xl shadow-green-900/20">
          <View className="rounded-[28px] overflow-hidden">
            <LinearGradient
              colors={["#16a34a", "#15803d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6"
            >
              <View className="flex-row items-center">
                <Pressable 
                  onPress={handleUpdateAvatar}
                  disabled={isUploading}
                  className="w-20 h-20 rounded-2xl bg-white/20 items-center justify-center border border-white/30 backdrop-blur-md overflow-hidden relative"
                >
                  {user?.avatar_url ? (
                    <Image 
                      source={{ uri: user.avatar_url }} 
                      className="w-full h-full" 
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={40} color="white" />
                  )}
                  {isUploading && (
                    <View className="absolute inset-0 bg-black/50 items-center justify-center">
                      <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                  )}
                  {!isUploading && (
                    <View className="absolute bottom-0 w-full bg-black/40 py-1 items-center justify-center">
                      <Text className="text-[8px] text-white font-bold uppercase tracking-widest">Edit</Text>
                    </View>
                  )}
                </Pressable>
                <View className="ml-5 flex-1">
                  <Text className="text-2xl font-black text-white tracking-tight">
                    {user?.name || "Customer"}
                  </Text>
                  <View className="flex-row items-center mt-1 opacity-80">
                    <Ionicons name="call-outline" size={14} color="white" />
                    <Text className="text-white text-sm font-bold ml-1">
                      {user?.phone || user?.email || "No contact info"}
                    </Text>
                  </View>
                  <View className="mt-3 bg-white/20 self-start px-3 py-1 rounded-full border border-white/20">
                    <Text className="text-[10px] font-black text-white uppercase tracking-wider">Verified Member</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mt-6">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              {section.title}
            </Text>
            <View className="bg-white mx-4 rounded-[28px] border border-gray-100 overflow-hidden">
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
