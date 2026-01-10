import { View, Text } from "react-native";
import { useAuth } from "@context/AuthContext";
import Button from "@shared/components/Button";

export default function ProfileScreen() {
  const { logout, user } = useAuth();

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Profile</Text>

      <View className="mb-8">
        <Text className="text-gray-500">Logged in as</Text>
        <Text className="text-xl font-medium">{user?.phone}</Text>
      </View>

      <Button title="Logout" variant="outline" onPress={logout} />
    </View>
  );
}
